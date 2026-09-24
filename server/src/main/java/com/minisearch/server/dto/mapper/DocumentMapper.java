package com.minisearch.server.dto.mapper;

import com.minisearch.server.dto.response.SearchResult;
import com.minisearch.server.models.DocumentEntity;

public class DocumentMapper {

    private DocumentMapper() {

    }

    public static SearchResult toSearchResult(DocumentEntity doc, String query, double score) {
        if (doc == null) return null;

        return SearchResult.builder()
                .docId(doc.getId())
                .url(doc.getUrl())
                .title(doc.getTitle())
                .snippet(buildSnippet(doc.getContent(), query))
                .score(score)
                .build();
    }

    public static String buildSnippet(String content, String query) {
        if (content == null || content.isBlank()) return "";

        String lower = content.toLowerCase();
        String firstTerm = (query == null || query.isBlank())
                ? ""
                : query.toLowerCase().split("\\s+")[0];

        int idx = firstTerm.isEmpty() ? -1 : lower.indexOf(firstTerm);

        if (idx < 0) {
            return content.substring(0, Math.min(250, content.length()))
                    + (content.length() > 250 ? "..." : "");
        }

        int start = Math.max(0, idx - 80);
        int end = Math.min(content.length(), start + 250);

        return (start > 0 ? "..." : "")
                + content.substring(start, end)
                + (end < content.length() ? "..." : "");
    }

}
