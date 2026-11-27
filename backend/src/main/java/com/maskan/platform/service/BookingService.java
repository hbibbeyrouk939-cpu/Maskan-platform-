package com.maskan.platform.service;

import com.maskan.platform.domain.entity.Booking;
import com.maskan.platform.domain.entity.Property;
import com.maskan.platform.domain.enums.BookingStatus;
import com.maskan.platform.dto.BookingDtos.*;
import com.maskan.platform.exception.BookingConflictException;
import com.maskan.platform.exception.MaskanException;
import com.maskan.platform.exception.ResourceNotFoundException;
import com.maskan.platform.repository.BookingRepository;
import com.maskan.platform.repository.PropertyRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class BookingService {
    private final BookingRepository bookingRepository;
    private final PropertyRepository propertyRepository;
    private final AuditService auditService;

    @Transactional(readOnly = true)
    public List<BookingResponse> listAll(BookingStatus statusFilter) {
        List<Booking> bookings = (statusFilter == null)
            ? bookingRepository.findAllWithProperty()
            : bookingRepository.findByStatusWithProperty(statusFilter);
        return bookings.stream().map(this::toDto).toList();
    }

    @Transactional
    public BookingResponse create(CreateBookingRequest req, UUID actorId) {
        if (!req.checkOut().isAfter(req.checkIn())) {
            throw new MaskanException(HttpStatus.BAD_REQUEST, "error.title.validation", "error.booking.invalid_dates");
        }
        Property property = propertyRepository.findByIdAndActiveTrue(req.propertyId())
            .orElseThrow(() -> new ResourceNotFoundException("error.property.not_found", req.propertyId()));

        BookingStatus targetStatus = req.status() != null ? req.status() : BookingStatus.PENDING;
        if ((targetStatus == BookingStatus.CONFIRMED || targetStatus == BookingStatus.PENDING)
            && bookingRepository.existsOverlappingActiveBooking(property.getId(), req.checkIn(), req.checkOut())) {
            throw new BookingConflictException(req.checkIn(), req.checkOut());
        }

        int nights = (int) ChronoUnit.DAYS.between(req.checkIn(), req.checkOut());
        BigDecimal totalUsd = property.getPricePerNightUsd().multiply(BigDecimal.valueOf(nights));
        String code = "BK-" + (410 + bookingRepository.count());

        Booking booking = Booking.builder()
            .bookingCode(code)
            .property(property)
            .guestName(req.guestName().trim())
            .guestPhone(req.guestPhone().trim())
            .checkIn(req.checkIn())
            .checkOut(req.checkOut())
            .nights(nights)
            .totalUsd(totalUsd)
            .status(targetStatus)
            .notes(req.notes())
            .createdBy(actorId)
            .build();

        Booking saved = bookingRepository.saveAndFlush(booking);
        auditService.record("BOOKING_CREATED", "BOOKING", saved.getBookingCode(),
            Map.of("property", property.getCode(), "totalUsd", totalUsd, "status", targetStatus.name()));
        return toDto(saved);
    }

    @Transactional
    public BookingResponse updateStatus(UUID id, BookingStatus nextStatus) {
        Booking booking = bookingRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("error.booking.not_found", id));
        BookingStatus prev = booking.getStatus();
        booking.setPreviousStatus(prev);
        booking.setStatus(nextStatus);
        Booking saved = bookingRepository.saveAndFlush(booking);
        auditService.record("BOOKING_STATUS_CHANGED", "BOOKING", saved.getBookingCode(),
            Map.of("from", prev.name(), "to", nextStatus.name()));
        return toDto(saved);
    }

    @Transactional
    public BookingResponse undoLastStatusChange(UUID id) {
        Booking booking = bookingRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("error.booking.not_found", id));
        if (booking.getPreviousStatus() == null) {
            throw new MaskanException(HttpStatus.BAD_REQUEST, "error.title.validation", "error.booking.cannot_undo", booking.getBookingCode());
        }
        BookingStatus restored = booking.getPreviousStatus();
        BookingStatus current = booking.getStatus();
        booking.setStatus(restored);
        booking.setPreviousStatus(null);
        Booking saved = bookingRepository.saveAndFlush(booking);
        auditService.record("BOOKING_STATUS_UNDONE", "BOOKING", saved.getBookingCode(),
            Map.of("revertedFrom", current.name(), "restoredTo", restored.name()));
        return toDto(saved);
    }

    private BookingResponse toDto(Booking b) {
        return new BookingResponse(
            b.getId(), b.getBookingCode(),
            b.getProperty().getId(), b.getProperty().getCode(),
            b.getProperty().getNameAr(), b.getProperty().getNameFr(),
            b.getGuestName(), b.getGuestPhone(),
            b.getCheckIn(), b.getCheckOut(), b.getNights(), b.getTotalUsd(),
            b.getStatus(), b.getPreviousStatus(), b.getNotes(), b.getCreatedAt()
        );
    }
}
