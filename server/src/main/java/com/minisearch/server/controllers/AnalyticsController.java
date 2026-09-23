package com.minisearch.server.controllers;

import com.minisearch.server.services.AnalyticsService;
import com.minisearch.server.services.IndexService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/analytics")
@RequiredArgsConstructor
public class AnalyticsController{

    private final AnalyticsService analyticsService;
    private final IndexService indexService;

    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> stats() {
        return ResponseEntity.ok(analyticsService.getStats());
    }

    @GetMapping("/trending")
    public ResponseEntity<List<Map<String, Object>>> trending(
            @RequestParam(defaultValue = "10") int limit) {
        return ResponseEntity.ok(analyticsService.getTopQueries(limit));
    }

    @PostMapping("/reindex")
    public ResponseEntity<Map<String, Object>> reindex() {
        indexService.rebuildIndex();
        return ResponseEntity.ok(Map.of("indexed", indexService.getIndexSize()));
    }

}
