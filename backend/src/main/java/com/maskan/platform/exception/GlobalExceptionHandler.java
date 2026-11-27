package com.maskan.platform.exception;

import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.context.MessageSource;
import org.springframework.context.i18n.LocaleContextHolder;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ProblemDetail;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.net.URI;
import java.time.Instant;
import java.util.LinkedHashMap;
import java.util.Locale;
import java.util.Map;

@RestControllerAdvice
@RequiredArgsConstructor
public class GlobalExceptionHandler {

    private final MessageSource messageSource;

    @ExceptionHandler(MaskanException.class)
    public ProblemDetail handleMaskanException(MaskanException ex, HttpServletRequest request) {
        Locale locale = LocaleContextHolder.getLocale();
        String title = messageSource.getMessage(ex.getTitleKey(), null, ex.getTitleKey(), locale);
        String detail = messageSource.getMessage(ex.getMessageKey(), ex.getArgs(), ex.getMessageKey(), locale);

        ProblemDetail pd = ProblemDetail.forStatusAndDetail(ex.getStatus(), detail);
        pd.setTitle(title);
        pd.setType(URI.create("https://api.maskan.mr/errors/" + ex.getMessageKey().replace('.', '-')));
        pd.setInstance(URI.create(request.getRequestURI()));
        pd.setProperty("timestamp", Instant.now());
        pd.setProperty("locale", locale.getLanguage());
        return pd;
    }

    @ExceptionHandler(DataIntegrityViolationException.class)
    public ProblemDetail handleDatabaseConstraint(DataIntegrityViolationException ex, HttpServletRequest request) {
        Locale locale = LocaleContextHolder.getLocale();
        String rootMsg = ex.getMostSpecificCause() != null ? ex.getMostSpecificCause().getMessage() : "";
        boolean isOverlap = rootMsg.contains("no_overlapping_active_bookings") || rootMsg.contains("23P01");

        HttpStatus status = isOverlap ? HttpStatus.CONFLICT : HttpStatus.BAD_REQUEST;
        String titleKey = isOverlap ? "error.title.conflict" : "error.title.validation";
        String detail = isOverlap
            ? messageSource.getMessage("error.booking.overlap", new Object[]{"?", "?"}, locale)
            : messageSource.getMessage("error.title.validation", null, locale);

        ProblemDetail pd = ProblemDetail.forStatusAndDetail(status, detail);
        pd.setTitle(messageSource.getMessage(titleKey, null, locale));
        pd.setType(URI.create(isOverlap ? "https://api.maskan.mr/errors/booking-overlap" : "https://api.maskan.mr/errors/integrity"));
        pd.setInstance(URI.create(request.getRequestURI()));
        pd.setProperty("timestamp", Instant.now());
        return pd;
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ProblemDetail handleValidation(MethodArgumentNotValidException ex, HttpServletRequest request) {
        Locale locale = LocaleContextHolder.getLocale();
        Map<String, String> fieldErrors = new LinkedHashMap<>();
        for (FieldError fe : ex.getBindingResult().getFieldErrors()) {
            fieldErrors.put(fe.getField(), fe.getDefaultMessage());
        }
        ProblemDetail pd = ProblemDetail.forStatusAndDetail(
            HttpStatus.BAD_REQUEST,
            messageSource.getMessage("error.title.validation", null, locale)
        );
        pd.setTitle(messageSource.getMessage("error.title.validation", null, locale));
        pd.setType(URI.create("https://api.maskan.mr/errors/validation"));
        pd.setInstance(URI.create(request.getRequestURI()));
        pd.setProperty("errors", fieldErrors);
        pd.setProperty("timestamp", Instant.now());
        return pd;
    }

    @ExceptionHandler(BadCredentialsException.class)
    public ProblemDetail handleBadCredentials(BadCredentialsException ex, HttpServletRequest request) {
        Locale locale = LocaleContextHolder.getLocale();
        ProblemDetail pd = ProblemDetail.forStatusAndDetail(
            HttpStatus.UNAUTHORIZED,
            messageSource.getMessage("error.auth.invalid_credentials", null, locale)
        );
        pd.setTitle(messageSource.getMessage("error.title.unauthorized", null, locale));
        pd.setType(URI.create("https://api.maskan.mr/errors/unauthorized"));
        pd.setInstance(URI.create(request.getRequestURI()));
        pd.setProperty("timestamp", Instant.now());
        return pd;
    }
}
