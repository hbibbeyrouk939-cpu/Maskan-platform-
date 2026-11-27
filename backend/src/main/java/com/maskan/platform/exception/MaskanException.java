package com.maskan.platform.exception;

import lombok.Getter;
import org.springframework.http.HttpStatus;

@Getter
public class MaskanException extends RuntimeException {
    private final HttpStatus status;
    private final String titleKey;
    private final String messageKey;
    private final Object[] args;

    public MaskanException(HttpStatus status, String titleKey, String messageKey, Object... args) {
        super(messageKey);
        this.status = status;
        this.titleKey = titleKey;
        this.messageKey = messageKey;
        this.args = args;
    }
}
