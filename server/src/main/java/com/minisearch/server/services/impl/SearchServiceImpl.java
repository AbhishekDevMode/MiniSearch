package com.minisearch.server.services.impl;
import com.minisearch.server.dto.request.SearchRequest;
import com.minisearch.server.dto.response.SearchResponse;
import com.minisearch.server.dto.response.SearchResult;
import com.minisearch.server.models.DocumentEntity;
import com.minisearch.server.models.SearchLogEntity;
import com.minisearch.server.index.BM25Ranker;
import com.minisearch.server.repositories.DocumentRepository;
import com.minisearch.server.repositories.SearchLogRepository;
import com.minisearch.server.services.SearchService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class SearchServiceImpl implements SearchService {

    private final BM25Ranker ranker;
    private final DocumentRepository documentRepository;
    private final SearchLogRepository searchLogRepository;

    @Override
    @Transactional
    public SearchResponse search(SearchRequest request) {
        long start = System.currentTimeMillis();

        List<BM25Ranker.ScoredDoc> scoredDocs = ranker.rank(request.getQuery());

        int from = Math.min(request.getOffset() != null ? request.getOffset() : 0, scoredDocs.size());
        int to = Math.min(from + (request.getLimit() != null ? request.getLimit() : 10), scoredDocs.size());
        List<BM25Ranker.ScoredDoc> paged = scoredDocs.subList(from, to);

        List<Long> docIds = paged.stream()
                .map(BM25Ranker.ScoredDoc::docId)
                .toList();

        Map<Long, DocumentEntity> docsById = documentRepository.findAllById(docIds)
                .stream()
                .collect(Collectors.toMap(DocumentEntity::getId, d -> d));

        List<SearchResult> results = paged.stream()
                .map(sd -> {
                    DocumentEntity doc = docsById.get(sd.docId());
                    if (doc == null) return null;
                    return SearchResult.builder()
                            .docId(doc.getId())
                            .url(doc.getUrl())
                            .title(doc.getTitle())
                            .snippet(buildSnippet(doc.getContent(), request.getQuery()))
                            .score(sd.score())
                            .build();
                })
                .filter(Objects::nonNull)
                .toList();

        long elapsed = System.currentTimeMillis() - start;

        try {
            searchLogRepository.save(SearchLogEntity.builder()
                    .query(request.getQuery())
                    .resultCount(scoredDocs.size())
                    .responseTimeMs(elapsed)
                    .build());
        } catch (Exception e) {
            log.warn("Failed to log search: {}", e.getMessage());
        }

        return SearchResponse.builder()
                .query(request.getQuery())
                .totalResults(scoredDocs.size())
                .responseTimeMs(elapsed)
                .results(results)
                .build();
    }

    @Override
    @Transactional
    public void logClick(String query, Long docId, Integer position) {
        searchLogRepository.save(SearchLogEntity.builder()
                .query(query)
                .clickedDocId(docId)
                .clickedPosition(position)
                .build());
    }

    private String buildSnippet(String content, String query) {
        if (content == null || content.isBlank()) return "";

        String lower = content.toLowerCase();
        String firstTerm = query.toLowerCase().split("\\s+")[0];
        int idx = lower.indexOf(firstTerm);

        if (idx < 0) {
            return content.substring(0, Math.min(250, content.length()))
                    + (content.length() > 250 ? "..." : "");
        }

        int start = Math.max(0, idx - 80);
        int end = Math.min(content.length(), start + 250);

        return (start > 0 ? "..." : "")
                + content.substring(start, end)
                + (end < content.length() ? "..." : "");
    }
}