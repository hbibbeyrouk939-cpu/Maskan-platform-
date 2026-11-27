package com.maskan.platform.controller;

import com.maskan.platform.domain.enums.BookingStatus;
import com.maskan.platform.dto.BookingDtos.*;
import com.maskan.platform.security.UserPrincipal;
import com.maskan.platform.service.BookingService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/bookings")
@RequiredArgsConstructor
@Tag(name = "Bookings")
public class BookingController {
    private final BookingService bookingService;

    @GetMapping
    public List<BookingResponse> listAll(@RequestParam(required = false) BookingStatus status) {
        return bookingService.listAll(status);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Create a booking with server-side price calculation and DB overlap guard")
    public BookingResponse create(
        @Valid @RequestBody CreateBookingRequest request,
        @AuthenticationPrincipal UserPrincipal principal
    ) {
        return bookingService.create(request, principal != null ? principal.getId() : null);
    }

    @PatchMapping("/{id}/status")
    @Operation(summary = "Transition booking status (e.g., approve/reject) and store previousStatus for Undo")
    public BookingResponse updateStatus(
        @PathVariable UUID id,
        @Valid @RequestBody UpdateBookingStatusRequest request
    ) {
        return bookingService.updateStatus(id, request.status());
    }

    @PostMapping("/{id}/undo")
    @Operation(summary = "Revert the most recent status transition on a booking")
    public BookingResponse undo(@PathVariable UUID id) {
        return bookingService.undoLastStatusChange(id);
    }
}
