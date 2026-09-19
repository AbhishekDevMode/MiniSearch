package com.minisearch.server.dto.response;

import java.util.List;

public class SearchResponse {

    private long totalResults;
    private long responseTimeMs;
    private List<SearchResult> results;
    private List<String> suggestions;

}

