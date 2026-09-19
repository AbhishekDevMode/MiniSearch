package com.minisearch.server.repositories;

import com.minisearch.server.models.CrawlQueueEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import com.minisearch.server.models.CrawlQueueEntity.CrawlStatus;
import org.springframework.data.jpa.repository.Query;

import java.awt.print.Pageable;
import java.util.List;
import java.util.Optional;

public interface CrawlQueueRepository extends JpaRepository<CrawlQueueEntity, Long> {

    Optional<CrawlQueueEntity> findByUrl(String url);

    List<CrawlQueueEntity> findByStatus(CrawlStatus status, Pageable pageable);

    long countByStatus(CrawlStatus status);

    @Query("SELECT q FROM CrawlQueueEntity q WHERE q.status = 'PENDING' ORDER BY q.createdAt ASC")
    List<CrawlQueueEntity> findNextPending(Pageable pageable);

}
