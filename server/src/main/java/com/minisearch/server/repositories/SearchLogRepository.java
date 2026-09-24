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

    @Query("SELECT s.query, COUNT(s) FROM SearchLogEntity s " +
            "GROUP BY s.query ORDER BY COUNT(s) DESC")
    List<Object[]> findTopQueries(Pageable pageable);

    List<SearchLogEntity> findBySearchedAtAfter(LocalDateTime since);

    long countByQueryContainingIgnoreCase(String keyword);

    List<SearchLogEntity> findTop50ByOrderBySearchedAtDesc();   // ✅ OrderBy + SearchedAt

    List<SearchLogEntity> findByQueryIgnoreCaseOrderBySearchedAtDesc(String query);
}