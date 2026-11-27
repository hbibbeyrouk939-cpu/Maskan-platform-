package com.maskan.platform.dto;

import com.maskan.platform.domain.enums.BookingStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

public final class BookingDtos {
    private BookingDtos() {}

    public record BookingResponse(
        UUID id,
        String bookingCode,
        UUID propertyId,
        String propertyCode,
        String propertyNameAr,
        String propertyNameFr,
        String guestName,
        String guestPhone,
        LocalDate checkIn,
        LocalDate checkOut,
        int nights,
        BigDecimal totalUsd,
        BookingStatus status,
        BookingStatus previousStatus,
        String notes,
        Instant createdAt
    ) {}

    public record CreateBookingRequest(
        @NotNull UUID propertyId,
        @NotBlank @Size(max = 160) String guestName,
        @NotBlank @Size(max = 48) String guestPhone,
        @NotNull LocalDate checkIn,
        @NotNull LocalDate checkOut,
        BookingStatus status,
        @Size(max = 1000) String notes
    ) {}

    public record UpdateBookingStatusRequest(
        @NotNull BookingStatus status
    ) {}
}
