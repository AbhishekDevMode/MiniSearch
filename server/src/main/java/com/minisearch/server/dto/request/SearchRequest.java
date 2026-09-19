package com.minisearch.server.dto.request;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class SearchRequest {

    @NotBlank(message="Query cannot be empty")
    @Size(max=200,message="Query too long")
    private String query;

    @Min(1) @Max(50)
    private Integer limit=10;

    @Min(0)
    private Integer offset=0;

}
