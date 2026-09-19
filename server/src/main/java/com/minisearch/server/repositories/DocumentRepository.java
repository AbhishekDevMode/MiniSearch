package com.minisearch.server.repositories;

import com.minisearch.server.models.DocumentEntity;
import org.springframework.stereotype.Repository;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

@Repository
public interface DocumentRepository extends JpaRepository<DocumentEntity, Long> {

    Optional<DocumentEntity> findByUrl(String url);

    boolean existsByUrl(String url);

    boolean existsByContentHash(String contentHash);

}
