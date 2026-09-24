package com.minisearch.server.crawler;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.net.URI;
import java.net.URL;
import java.net.HttpURLConnection;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Slf4j
@Component
public class RobotsTxtChecker {

    private final Map<String, List<String>> cache = new ConcurrentHashMap<>();

    private static final String USER_AGENT = "MiniSearchBot";

    private static final int TIMEOUT_MS = 3000;

    public boolean isAllowed(String url) {
        if (url == null || url.isBlank()) return false;

        try {
            URI uri = new URI(url);
            String scheme = uri.getScheme();
            String host = uri.getHost();
            if (scheme == null || host == null) return true;

            String domain = scheme + "://" + host;

            List<String> disallowRules = cache.computeIfAbsent(domain, this::fetchRules);
            if (disallowRules == null || disallowRules.isEmpty()) return true;

            String path = uri.getPath();
            if (path == null || path.isEmpty()) path = "/";

            for (String rule : disallowRules) {
                if (pathMatches(path, rule)) {
                    log.debug("Blocked by robots.txt: {} (rule: {})", url, rule);
                    return false;
                }
            }
            return true;
        } catch (Exception e) {
            log.warn("robots.txt check failed for {}: {}", url, e.getMessage());
            return true; // fail open — better to try than to give up
        }
    }

    private List<String> fetchRules(String domain) {
        String robotsUrl = domain + "/robots.txt";
        List<String> rules = new ArrayList<>();

        log.info("Fetching robots.txt: {}", robotsUrl);

        HttpURLConnection conn = null;
        try {
            URL url = new URL(robotsUrl);
            conn = (HttpURLConnection) url.openConnection();
            conn.setRequestMethod("GET");
            conn.setConnectTimeout(TIMEOUT_MS);
            conn.setReadTimeout(TIMEOUT_MS);
            conn.setRequestProperty("User-Agent", USER_AGENT + "/1.0");
            conn.setInstanceFollowRedirects(true);

            int status = conn.getResponseCode();

            if (status < 200 || status >= 300) {
                log.info("robots.txt {} returned status {} — allow all", robotsUrl, status);
                return rules;
            }

            try (BufferedReader reader = new BufferedReader(
                    new InputStreamReader(conn.getInputStream(), StandardCharsets.UTF_8))) {

                boolean applicable = false;
                String line;

                while ((line = reader.readLine()) != null) {
                    line = line.trim();

                    int hash = line.indexOf('#');
                    if (hash >= 0) line = line.substring(0, hash).trim();

                    if (line.isEmpty()) continue;

                    String[] parts = line.split(":", 2);
                    if (parts.length < 2) continue;

                    String key = parts[0].trim().toLowerCase();
                    String value = parts[1].trim();

                    if (key.equals("user-agent")) {
                        applicable = value.equals("*")
                                || USER_AGENT.toLowerCase().contains(value.toLowerCase());
                    } else if (applicable && key.equals("disallow")) {
                        if (!value.isEmpty()) {
                            rules.add(value);
                        }
                    }
                }
            }

            log.info("Parsed {} disallow rules for {}", rules.size(), domain);
        } catch (Exception e) {
            log.warn("Could not fetch robots.txt for {}: {}", domain, e.getMessage());
        } finally {
            if (conn != null) conn.disconnect();
        }

        return rules;
    }
    private boolean pathMatches(String path, String rule) {
        if (rule.equals("/")) return true;   // disallow everything

        boolean anchored = rule.endsWith("$");
        if (anchored) {
            rule = rule.substring(0, rule.length() - 1);
        }

        if (rule.contains("*")) {
            String regex = rule
                    .replace(".", "\\.")
                    .replace("*", ".*");
            return path.matches(regex + (anchored ? "$" : ".*"));
        }

        return anchored ? path.equals(rule) : path.startsWith(rule);
    }

    public void clearCache() {
        cache.clear();
    }
}