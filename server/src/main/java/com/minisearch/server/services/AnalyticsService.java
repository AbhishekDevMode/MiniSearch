package com.minisearch.server.services;

import java.util.List;
import java.util.Map;


public interface AnalyticsService {

    List<Map<String, Object>> getTopQueries(int limit);

    Map<String, Object> getStats();

}
