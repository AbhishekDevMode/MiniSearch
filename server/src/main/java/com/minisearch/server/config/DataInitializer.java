package com.minisearch.server.config;

import com.minisearch.server.services.IndexService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final IndexService indexService;

    @Override
    public void run(String... args) {
        log.info("🔧 Initializing search index from DB...");
        indexService.rebuildIndex();
        log.info("✅ Index ready: {} documents", indexService.getIndexSize());
    }

}
