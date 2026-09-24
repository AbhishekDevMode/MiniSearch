package com.minisearch.server.util;

import java.net.URI;
import java.net.URISyntaxException;

public final class UrlUtils {

    private UrlUtils() {}

    public static boolean isValidUrl(String url) {
        if (url == null || url.isBlank()) return false;
        try {
            URI uri = new URI(url.trim());
            String scheme = uri.getScheme();
            return ("http".equalsIgnoreCase(scheme) || "https".equalsIgnoreCase(scheme))
                    && uri.getHost() != null;
        } catch (URISyntaxException e) {
            return false;
        }
    }

    public static String extractDomain(String url) {
        if (url == null || url.isBlank()) return "";
        try {
            URI uri = new URI(url.trim());
            String host = uri.getHost();
            return host == null ? "" : host.toLowerCase();
        } catch (Exception e) {
            return "";
        }
    }

    public static boolean isSameDomain(String url1, String url2) {
        String d1 = extractDomain(url1);
        String d2 = extractDomain(url2);
        return !d1.isEmpty() && d1.equalsIgnoreCase(d2);
    }

    public static String normalizeUrl(String url) {
        if (url == null || url.isBlank()) return "";
        try {
            URI uri = new URI(url.trim());
            String scheme = uri.getScheme() != null ? uri.getScheme().toLowerCase() : "http";
            String host = uri.getHost() != null ? uri.getHost().toLowerCase() : "";
            int port = uri.getPort();
            String path = uri.getPath();
            if (path == null || path.isEmpty()) path = "/";
            String query = uri.getQuery();

            StringBuilder sb = new StringBuilder();
            sb.append(scheme).append("://").append(host);
            if (port != -1 && port != 80 && port != 443) {
                sb.append(":").append(port);
            }
            sb.append(path);
            if (query != null && !query.isEmpty()) {
                sb.append("?").append(query);
            }
            return sb.toString();
        } catch (Exception e) {
            return url.trim();
        }
    }
}
