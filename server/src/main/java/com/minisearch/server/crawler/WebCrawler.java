package com.minisearch.server.crawler;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.jsoup.Jsoup;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import java.io.IOException;
import java.util.List;
import java.util.Optional;

@Slf4j
@Component
@RequiredArgsConstructor
public class WebCrawler {

    private final RobotsTxtChecker robotsTxtChecker;

    @Value("${minisearch.crawler.user-agent:Mozilla/5.0 (compatible; MiniSearchBot/1.0)}")
    private String userAgent;

    @Value("${minisearch.crawler.timeout-ms:10000}")
    private int timeoutMs;

    public record CrawledPage(String url, String title, String content, List<String> links) {}

    public Optional<CrawledPage> crawlPage(String url) {

        if (!robotsTxtChecker.isAllowed(url)) {
            log.info("🚫 Blocked by robots.txt: {}", url);
            return Optional.empty();
        }

        try {
            var doc = Jsoup.connect(url)
                    .userAgent(userAgent)
                    .timeout(timeoutMs)
                    .followRedirects(true)
                    .ignoreHttpErrors(true)
                    .get();

            List<String> links = doc.select("a[href]").stream()
                    .map(el -> el.absUrl("href"))
                    .filter(link -> !link.isEmpty() && link.startsWith("http"))
                    .distinct()
                    .toList();

            return Optional.of(new CrawledPage(
                    url,
                    doc.title(),
                    doc.body().text(),
                    links
            ));
        } catch (IOException e) {
            log.warn("Failed to crawl {}: {}", url, e.getMessage());
            return Optional.empty();
        }
    }
}
