package com.minisearch.server.dto.response;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SearchResult {

    private Long docId;
    private String url;
    private String title;
    private String snippet;
    private Double score;

}


