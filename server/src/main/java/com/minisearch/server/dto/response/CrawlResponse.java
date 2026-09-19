package com.minisearch.server.dto.response;

import lombok.*;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CrawlResponse {

    private String seedUrl;
    private int pagesCrawled;
    private int pagesIndexed;
    private int duplicatesSkipped;
    private long durationMs;
    private List<String> errors;

}

