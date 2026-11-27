package com.maskan.platform.exception;

import org.springframework.http.HttpStatus;

public class ResourceNotFoundException extends MaskanException {
    public ResourceNotFoundException(String messageKey, Object... args) {
        super(HttpStatus.NOT_FOUND, "error.title.not_found", messageKey, args);
    }
}
