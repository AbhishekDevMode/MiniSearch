package com.minisearch.server.services.impl;

import com.minisearch.server.models.SearchLogEntity;
import org.springframework.data.jpa.repository.Query;

import java.awt.print.Pageable;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

public interface SearchLogRepository extends JpaRepository<SearchLogEnity, Long> {

    @Query("SELECT s.query ,COUNT(s) FROM SearchLogEntity s" + "GROUP BY s.query ORDER BY COUNT(s) DESC")
    List<Object[]> findTopQueries(Pageable pageable);

    List<SearchLogEntity> findBySearchedAtAfter(LocalDateTime since);

    long countByQueryIgnoreCaseOrderBySearchedAtDesc(String query);

    List<SearchLogEntity> findTop50ByOrderSearchAtDesc();

}
