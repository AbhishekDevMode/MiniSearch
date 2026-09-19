package com.minisearch.server.services.impl;

import com.minisearch.server.models.DocumentEntity;
import com.minisearch.server.index.InvertedIndex;
import com.minisearch.server.repositories.DocumentRepository;
import com.minisearch.server.services.IndexService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@RequiredArgsConstructor
public class IndexServiceImpl implements IndexService {

    private final InvertedIndex index;
    private final DocumentRepository documentRepository;

    @Override
    public void indexDocument(DocumentEntity doc) {
        index.addDocument(doc.getId(), doc.getTitle(), doc.getContent());
        log.debug("Indexed doc {}: {}", doc.getId(), doc.getUrl());
    }

    @Override
    public void removeDocument(Long docId) {
        index.removeDocument(docId);
    }

    @Override
    @Transactional(readOnly = true)
    public void rebuildIndex() {
        log.info("Rebuilding index...");
        index.clear();
        documentRepository.findAll().forEach(this::indexDocument);
        log.info("Index rebuilt with {} documents", index.size());
    }

    @Override
    public void clearIndex() {
        index.clear();
    }

    @Override
    public int getIndexSize() {
        return index.size();
    }
}