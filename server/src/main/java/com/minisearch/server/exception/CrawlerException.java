package com.minisearch.server.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;


    @ResponseStatus(HttpStatus.INTERNAL_SERVER_ERROR)
    public class CrawlerException extends RuntimeException {

        public CrawlerException(String message) {
            super(message);
        }

        public CrawlerException(String message, Throwable cause) {
            super(message, cause);
        }
}
