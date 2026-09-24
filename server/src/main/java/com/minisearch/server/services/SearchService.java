package com.minisearch.server.services;
import com.minisearch.server.dto.request.SearchRequest;
import com.minisearch.server.dto.response.SearchResponse;

import java.util.List;

public interface SearchService {

    SearchResponse search(SearchRequest request);

    void logClick(String query, Long docId, Integer position);

    List<String> getSuggestions(String prefix, int limit);
}
