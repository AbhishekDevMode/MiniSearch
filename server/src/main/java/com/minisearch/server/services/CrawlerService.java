package com.minisearch.server.services;

import com.minisearch.server.dto.request.CrawlRequest;
import com.minisearch.server.dto.response.CrawlResponse;

public interface CrawlerService {
    CrawlResponse crawl(CrawlRequest request);

    void enqueueUrl(String url);

}
