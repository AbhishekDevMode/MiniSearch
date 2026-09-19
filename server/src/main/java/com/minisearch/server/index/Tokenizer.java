package com.minisearch.server.index;

import lombok.extern.slf4j.Slf4j;
import org.apache.lucene.analysis.Analyzer;
import org.apache.lucene.analysis.TokenStream;
import org.apache.lucene.analysis.en.EnglishAnalyzer;
import org.apache.lucene.analysis.tokenattributes.CharTermAttribute;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

@Slf4j
@Component
public class Tokenizer {

    private final Analyzer analyzer = new EnglishAnalyzer();

    public List<String> tokenize(String text) {
        if(text == null || text.isBlank()) return List.of();

        List<String> tokens = new ArrayList<>();
        try (TokenStream ts = analyzer.tokenStream("content", text)) {
            CharTermAttribute attr = ts.addAttribute(CharTermAttribute.class);
            ts.reset();
            while (ts.incrementToken()) {
                tokens.add(attr.toString());
            }
            ts.end();
        } catch (IOException e) {
            log.error("Tokenization failed", e);
        }
        return tokens;
    }

}
