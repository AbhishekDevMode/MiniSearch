package com.minisearch.server.services.impl;

import java.time.LocalDateTime;

public class SearchLogEntity {
    private String query;
    private LocalDateTime searchedAt;
    private Long clickedDocId;
    private Integer resultCount;
}
