package com.minisearch.server.models;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name="documents")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DocumentEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 500, unique = true)
    private String url;

    @Column(length = 500)
    private String title;

    @Lob
    @Column(columnDefinition = "LONGTEXT")
    private String content;

    @Column(name = "content_hash", length = 64)
    private String contentHash;

    @Column(name = "term_count")
    private Integer termCount;

    @Column(name = "crawled_at")
    private LocalDateTime crawledAt;

    @PrePersist
    public void prePersist() {
        if (crawledAt == null) crawledAt = LocalDateTime.now();
    }
}

