package com.minisearch.server.controllers;

import com.minisearch.server.crawler.WebCrawler;
import com.minisearch.server.dto.request.CrawlRequest;
import com.minisearch.server.dto.response.CrawlResponse;
import com.minisearch.server.repositories.CrawlQueueRepository;
import com.minisearch.server.repositories.DocumentRepository;
import com.minisearch.server.services.CrawlerService;
import com.minisearch.server.services.IndexService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/students")
@RequiredArgsConstructor
public class CrawlerController  {
    private final CrawlerService crawlerService;
    public ResponseEntity<CrawlResponse> crawl(@Valid @RequestBody CrawlRequest request) {
        return ResponseEntity.ok(crawlerService.crawl(request));
    }

}



