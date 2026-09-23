package com.minisearch.server.controllers;

import com.minisearch.server.dto.request.SearchRequest;
import com.minisearch.server.dto.response.SearchResponse;
import com.minisearch.server.services.SearchService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/search")
@RequiredArgsConstructor
public class SearchController{

    @Autowired
    private final SearchService searchService;
    @Autowired
    private final SearchRequest searchRequest;

    @GetMapping
    public ResponseEntity<SearchResponse> quickSearch(
            @RequestParam("q") String query,
            @RequestParam(value = "limit", defaultValue = "10") int limit) {


        searchRequest.setQuery(query);
        searchRequest.setLimit(limit);
        searchRequest.setOffset(0);

        return ResponseEntity.ok(searchService.search(searchRequest));
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