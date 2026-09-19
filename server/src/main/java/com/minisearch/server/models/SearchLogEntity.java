package com.minisearch.server.models;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name="search_logs",indexes={
        @Index(name="idx_query",columnList = "query"),
        @Index(name="idx_time",columnList = "searched_at")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SearchLogEntity {

    @Id
    @GeneratedValue(strategy= GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false,length=500)
    private String query;

    @Column(name="result_count")
    private Integer resultCount;

    @Column(name="response_time_ms")
    private Long responseTimeMs;

    @Column(name="clicked_doc_id")
    private Long clickedDocId;

    @Column(name="clicked_position")
    private Integer clickedPosition;

    @Column(name="searched_at")
    private LocalDateTime searchedAt;

    @PrePersist
    public void prePersist(){
        if(searchedAt==null)searchedAt=LocalDateTime.now();
    }

}
