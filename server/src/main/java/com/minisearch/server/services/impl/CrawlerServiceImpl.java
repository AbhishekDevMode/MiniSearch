package com.minisearch.server.services.impl;

import com.minisearch.server.crawler.WebCrawler;
import com.minisearch.server.dto.request.CrawlRequest;
import com.minisearch.server.dto.response.CrawlResponse;
import com.minisearch.server.models.CrawlQueueEntity;
import com.minisearch.server.models.DocumentEntity;
import com.minisearch.server.repositories.CrawlQueueRepository;
import com.minisearch.server.repositories.DocumentRepository;
import com.minisearch.server.services.CrawlerService;
import com.minisearch.server.services.IndexService;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.util.*;


@Slf4j
@Service
@RequiredArgsConstructor
public class CrawlerServiceImpl implements CrawlerService {

    private final WebCrawler webCrawler;
    private final DocumentRepository documentRepository;
    private final CrawlQueueRepository crawlQueueRepository;
    private final IndexService indexService;

    @Override
    @Transactional
    public CrawlResponse crawl(CrawlRequest request) {
        long start = System.currentTimeMillis();

        Set<String> visited = new HashSet<>();
        Queue<String> queue = new LinkedList<>();
        queue.add(request.getSeedUrl());

        int crawled = 0;
        int indexed = 0;
        int duplicates = 0;
        List<String> errors = new ArrayList<>();
        String seedDomain = extractDomain(request.getSeedUrl());
        while (!queue.isEmpty() && crawled < request.getMaxPages()) {
            String url = queue.poll();
            if (visited.contains(url)) continue;
            visited.add(url);
            Optional<WebCrawler.CrawledPage> pageOpt = webCrawler.crawlPage(url);
            if (pageOpt.isEmpty()) {
                errors.add("Failed: " + url);
                continue;
            }

            WebCrawler.CrawledPage page = pageOpt.get();
            crawled++;

            String hash = sha256(page.content());
            if (documentRepository.existsByContentHash(hash)) {
                duplicates++;
                continue;
            }

            if (documentRepository.existsByUrl(page.url())) {
                duplicates++;
                continue;
            }

            DocumentEntity doc = DocumentEntity.builder().url(page.url()).title(page.title()).content(page.content()).contentHash(hash).termCount(page.content().split("\\s+").length).build();
            doc = documentRepository.save(doc);
            indexService.indexDocument(doc);
            indexed++;
            for (String link : page.links()) {
                if (extractDomain(link).equals(seedDomain) && !visited.contains(link)){
                    queue.add(link);
                }
            }

        }
        long elapsed = System.currentTimeMillis() - start;
        log.info("Crawl complete:crawled={},indexed={},duplicates={},time={}ms", crawled, indexed, duplicates, elapsed);
        return CrawlResponse.builder().seedUrl(request.getSeedUrl()).pagesCrawled(crawled).pagesIndexed(indexed).duplicatesSkipped(duplicates).durationMs(elapsed).errors(errors).build();
    }

    @Override
    @Transactional
    public void enqueueUrl(String url) {
        if (crawlQueueRepository.findByUrl(url).isEmpty()) {
            crawlQueueRepository.save(CrawlQueueEntity.builder()
                    .url(url)
                    .status(CrawlQueueEntity.CrawlStatus.PENDING)
                    .build());
            log.info("Enqueued: {}", url);
        }
    }

    private String extractDomain(String url) {
        try {
            String host = new java.net.URI(url).getHost();
            return host == null ? "" : host;
        } catch (Exception e) {
            return "";
        }
    }

    private String sha256(String input) {
        try {
            MessageDigest md = MessageDigest.getInstance("SHA-256");
            byte[] hash = md.digest(input.getBytes(StandardCharsets.UTF_8));
            StringBuilder sb = new StringBuilder();
            for (byte b : hash) sb.append(String.format("%02x", b));
            return sb.toString();
        } catch (Exception e) {
            return UUID.randomUUID().toString();
        }
    }

}