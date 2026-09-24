package com.minisearch.server.controllers;

import com.minisearch.server.dto.request.SearchRequest;
import com.minisearch.server.dto.response.SearchResponse;
import com.minisearch.server.services.SearchService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/search")
@RequiredArgsConstructor
public class SearchController {

    private final SearchService searchService;

    @GetMapping
    public ResponseEntity<SearchResponse> quickSearch(
            @RequestParam("q") String query,
            @RequestParam(value = "limit", defaultValue = "10") int limit,
            @RequestParam(value = "offset", defaultValue = "0") int offset) {

        SearchRequest request = new SearchRequest(query, limit, offset);
        return ResponseEntity.ok(searchService.search(request));
    }

    @GetMapping("/suggestions")
    public ResponseEntity<List<String>> suggestions(
            @RequestParam(value = "q", defaultValue = "") String query,
            @RequestParam(value = "limit", defaultValue = "5") int limit) {
        return ResponseEntity.ok(searchService.getSuggestions(query, limit));
    }

    @PostMapping
    public ResponseEntity<SearchResponse> search(
            @Valid @RequestBody SearchRequest request) {
        return ResponseEntity.ok(searchService.search(request));
    }

    @PostMapping("/click")
    public ResponseEntity<Void> logClick(
            @RequestParam String query,
            @RequestParam Long docId,
            @RequestParam Integer position) {
        searchService.logClick(query, docId, position);
        return ResponseEntity.ok().build();
    }

}