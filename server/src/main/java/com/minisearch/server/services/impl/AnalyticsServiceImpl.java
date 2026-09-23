package com.minisearch.server.services.impl;

import com.minisearch.server.repositories.DocumentRepository;
import com.minisearch.server.repositories.SearchLogRepository;
import com.minisearch.server.services.AnalyticsService;
import com.minisearch.server.services.IndexService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class AnalyticsServiceImpl implements AnalyticsService {

    private final SearchLogRepository searchLogRepository;
    private final DocumentRepository documentRepository;
    private final IndexService indexService;

    @Override
    public List<Map<String, Object>> getTopQueries(int limit) {
        // Pageable is from org.springframework.data.domain — NOT java.awt.print
        Pageable page = PageRequest.of(0, limit);

        return searchLogRepository.findTopQueries(page)
                .stream()
                .map(row -> Map.of(
                        "query", row[0],
                        "count", row[1]
                ))
                .toList();
    }

    @Override
    public Map<String, Object> getStats() {
        Map<String, Object> stats = new HashMap<>();
        stats.put("documentsInDb", documentRepository.count());
        stats.put("documentsIndexed", indexService.getIndexSize());
        stats.put("totalSearches", searchLogRepository.count());
        return stats;
    }

}