package com.minisearch.server.dto.request;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class CrawlRequest {

    @NotBlank
    @Pattern(regexp = "^https?://.+", message = "Must be a valid url")
    private String seedUrl;
    @Min(1)
    @Max(1000)
    private Integer maxPages = 50;

}


