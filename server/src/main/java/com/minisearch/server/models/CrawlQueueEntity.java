package com.minisearch.server.models;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "crawl_queue", indexes = {
        @Index(name = "idx_status", columnList = "status")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CrawlQueueEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 2048, unique = true)
    private String url;

    @Enumerated
    @Column(nullable=false,length=20)
    @Builder.Default
    private CrawlStatus status=CrawlStatus.PENDING;

    @Column(name="retry_count")
    @Builder.Default
    private Integer retryCount = 0;

    @Column(name = "last_attempt")
    private LocalDateTime lastAttempt;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @PrePersist
    public void prePersist() {
        if (createdAt == null) createdAt = LocalDateTime.now();
    }

    public enum CrawlStatus {
        PENDING, CRAWLING, CRAWLED, FAILED
    }

}
