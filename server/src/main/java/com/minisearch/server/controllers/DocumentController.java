package com.minisearch.server.controllers;

import com.minisearch.server.exception.ResourceNotFoundException;
import com.minisearch.server.models.DocumentEntity;
import com.minisearch.server.repositories.DocumentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
    @RequestMapping("/api/documents")
    @RequiredArgsConstructor
    public class DocumentController {

        private final DocumentRepository documentRepository;

        @GetMapping
        public ResponseEntity<Page<DocumentEntity>> list(
                @RequestParam(defaultValue = "0") int page,
                @RequestParam(defaultValue = "20") int size) {
            return ResponseEntity.ok(documentRepository.findAll(PageRequest.of(page, size)));
        }

        @GetMapping("/{id}")
        public ResponseEntity<DocumentEntity> getById(@PathVariable Long id) {
            return documentRepository.findById(id)
                    .map(ResponseEntity::ok)
                    .orElseThrow(() -> new ResourceNotFoundException("Document not found: " + id));
        }

        @DeleteMapping("/{id}")
        public ResponseEntity<Void> delete(@PathVariable Long id) {
            documentRepository.deleteById(id);
            return ResponseEntity.noContent().build();
        }
    }
