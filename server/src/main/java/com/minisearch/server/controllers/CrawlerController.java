package com.minisearch.server.controllers;

import com.minisearch.server.dto.request.CrawlRequest;
import com.minisearch.server.dto.response.CrawlResponse;
import com.minisearch.server.services.CrawlerService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/crawler")
@RequiredArgsConstructor
public class CrawlerController {

    private final CrawlerService crawlerService;

    @PostMapping("/crawl")
    public ResponseEntity<CrawlResponse> crawl(@Valid @RequestBody CrawlRequest request) {
        return ResponseEntity.ok(crawlerService.crawl(request));
    }

    @PostMapping("/enqueue")
    public ResponseEntity<Void> enqueue(@RequestParam String url) {
        crawlerService.enqueueUrl(url);
        return ResponseEntity.ok().build();
    }

}



