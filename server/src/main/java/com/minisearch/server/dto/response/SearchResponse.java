package com.minisearch.server.dto.response;

import lombok.*;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SearchResponse {

    private String query;
    private long totalResults;
    private long responseTimeMs;
    private List<SearchResult> results;
    private List<String> suggestions;

}

