package com.minisearch.server.repositories;

import com.minisearch.server.models.SearchLogEntity;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface SearchLogRepository extends JpaRepository<SearchLogEntity, Long> {

    // Top N most frequent queries → returns rows of [query, count]
    @Query("SELECT s.query, COUNT(s) FROM SearchLogEntity s " +
            "GROUP BY s.query ORDER BY COUNT(s) DESC")
    List<Object[]> findTopQueries(Pageable pageable);

    // All logs since a given time
    List<SearchLogEntity> findBySearchedAtAfter(LocalDateTime since);

    // Count queries containing a keyword
    long countByQueryContainingIgnoreCase(String keyword);

    // Recent 50 logs (corrected name)
    List<SearchLogEntity> findTop50ByOrderBySearchedAtDesc();   // ✅ OrderBy + SearchedAt

    // All logs for a specific query, newest first
    List<SearchLogEntity> findByQueryIgnoreCaseOrderBySearchedAtDesc(String query);
}