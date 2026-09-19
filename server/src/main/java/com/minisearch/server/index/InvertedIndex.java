package com.minisearch.server.index;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;

@Component
@Getter
@RequiredArgsConstructor
public class InvertedIndex {

    private final Map<String, Set<Long>> index = new ConcurrentHashMap<>();
    private final Map<Long, Map<String, Integer>> termFreqs = new ConcurrentHashMap<>();
    private final Map<Long, Integer> docLengths = new ConcurrentHashMap<>();

    private final Tokenizer tokenizer;

    public synchronized void addDocument(Long docId, String title, String content) {
        // Tokenize: title is boosted (repeated) so matches in title rank higher
        List<String> tokens = tokenizer.tokenize(title + " " + title + " " + content);

        docLengths.put(docId, tokens.size());

        Map<String, Integer> tf = new HashMap<>();
        for (String t : tokens) {
            tf.merge(t, 1, Integer::sum);
        }
        termFreqs.put(docId, tf);

        for (String term : tf.keySet()) {
            index.computeIfAbsent(term, k -> ConcurrentHashMap.newKeySet()).add(docId);
        }
    }

    public synchronized void removeDocument(Long docId) {
        Map<String, Integer> tf = termFreqs.remove(docId);
        docLengths.remove(docId);
        if (tf != null) {
            for (String term : tf.keySet()) {
                Set<Long> docs = index.get(term);
                if (docs != null) {
                    docs.remove(docId);
                    if (docs.isEmpty()) {
                        index.remove(term);
                    }
                }
            }
        }
    }

    public synchronized void clear() {
        index.clear();
        termFreqs.clear();
        docLengths.clear();
    }

    public int size() {
        return docLengths.size();
    }

    public Set<Long> lookup(String term) {
        return index.getOrDefault(term, Set.of());
    }

}