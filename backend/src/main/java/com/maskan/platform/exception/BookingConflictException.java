package com.maskan.platform.exception;

import org.springframework.http.HttpStatus;

import java.time.LocalDate;

public class BookingConflictException extends MaskanException {
    public BookingConflictException(LocalDate checkIn, LocalDate checkOut) {
        super(HttpStatus.CONFLICT, "error.title.conflict", "error.booking.overlap", checkIn, checkOut);
    }
}
