package com.minisearch.server.services.impl;

import com.minisearch.server.dto.mapper.DocumentMapper;
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

import java.util.List;
import java.util.Map;
import java.util.Objects;
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

        int offset = request.getOffset() != null ? request.getOffset() : 0;
        int limit  = request.getLimit()  != null ? request.getLimit()  : 10;

        int from = Math.min(offset, scoredDocs.size());
        int to   = Math.min(from + limit, scoredDocs.size());
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
                    return DocumentMapper.toSearchResult(doc, request.getQuery(), sd.score());
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

        List<String> suggestions = List.of();
        try {
            suggestions = getSuggestions(request.getQuery(), 4);
        } catch (Exception e) {
            log.debug("Suggestions lookup failed: {}", e.getMessage());
        }

        return SearchResponse.builder()
                .query(request.getQuery())
                .totalResults(scoredDocs.size())
                .responseTimeMs(elapsed)
                .results(results)
                .suggestions(suggestions)
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

    @Override
    @Transactional(readOnly = true)
    public List<String> getSuggestions(String prefix, int limit) {
        int max = limit > 0 ? limit : 5;
        if (prefix == null || prefix.trim().isEmpty()) {
            return searchLogRepository.findTopQueries(org.springframework.data.domain.PageRequest.of(0, max))
                    .stream()
                    .map(row -> (String) row[0])
                    .filter(Objects::nonNull)
                    .distinct()
                    .toList();
        }
        String clean = prefix.trim().toLowerCase();
        return searchLogRepository.findTopQueries(org.springframework.data.domain.PageRequest.of(0, 50))
                .stream()
                .map(row -> (String) row[0])
                .filter(q -> q != null && q.toLowerCase().contains(clean))
                .distinct()
                .limit(max)
                .toList();
    }

}