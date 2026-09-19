package com.minisearch.server.services;

import com.minisearch.server.models.DocumentEntity;

public interface IndexService {

    void indexDocument(DocumentEntity doc);

    void removeDocument(Long docId);

    void rebuildIndex();

    void clearIndex();

    int getIndexSize();
}
