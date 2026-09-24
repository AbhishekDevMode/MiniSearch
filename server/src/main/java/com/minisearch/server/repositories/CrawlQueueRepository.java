package com.minisearch.server.repositories;

import com.minisearch.server.models.CrawlQueueEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import com.minisearch.server.models.CrawlQueueEntity.CrawlStatus;
import org.springframework.data.domain.Pageable;
import java.util.List;
import java.util.Optional;

public interface CrawlQueueRepository extends JpaRepository<CrawlQueueEntity, Long> {

    Optional<CrawlQueueEntity> findByUrl(String url);

    List<CrawlQueueEntity> findByStatus(CrawlStatus status, Pageable pageable);

    long countByStatus(CrawlStatus status);

    List<CrawlQueueEntity> findByStatusOrderByCreatedAtAsc(CrawlStatus status);

    boolean existsByUrl(String url);

}
