package com.minisearch.server.repositories;

import com.minisearch.server.models.SearchLogEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.awt.print.Pageable;
import java.time.LocalDateTime;
import java.util.List;

public interface SearchLogRepsoitory extends JpaRepository<SearchLogEntity, Long> {

    @Query("SELECT s.query, COUNT(s) as cnt FROM SearchLogEntity s " +
            "GROUP BY s.query ORDER BY cnt DESC")
    List<Object[]> findTopQueries(Pageable pageable);

    List<SearchLogEntity> findBySearchedAtAfter(LocalDateTime since);

    long countByQueryContainingIgnoreCase(String keyword);

}
