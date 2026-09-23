package com.minisearch.server.index;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.*;

@Component
@RequiredArgsConstructor
public class BM25Ranker {

    private final InvertedIndex index;
    private final Tokenizer tokenizer;

    private static final double K1 = 1.5;
    private static final double B = 0.75;

    public record ScoredDoc(Long docId, double score) {}

    public List<ScoredDoc> rank(String query) {
        List<String> tokens = tokenizer.tokenize(query);
        if (tokens.isEmpty()) return List.of();

        int N = index.size();
        if (N == 0) return List.of();

        double avgDl = index.getDocLengths().values().stream()
                .mapToInt(Integer::intValue)
                .average()
                .orElse(1.0);

        Map<Long, Double> scores = new HashMap<>();

        for (String term : tokens) {
            Set<Long> docs = index.getIndex().get(term);
            if (docs == null || docs.isEmpty()) continue;

            double idf = Math.log((N - docs.size() + 0.5) / (docs.size() + 0.5) + 1);

            for (Long docId : docs) {
                int tf = index.getTermFreqs().get(docId).getOrDefault(term, 0);
                int dl = index.getDocLengths().get(docId);

                double score = idf * (tf * (K1 + 1)) /
                        (tf + K1 * (1 - B + B * dl / avgDl));

                scores.merge(docId, score, Double::sum);
            }
        }

        return scores.entrySet().stream()
                .map(e -> new ScoredDoc(e.getKey(), e.getValue()))
                .sorted(Comparator.comparingDouble(ScoredDoc::score).reversed())
                .toList();
    }
}