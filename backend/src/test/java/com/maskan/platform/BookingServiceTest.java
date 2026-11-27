package com.maskan.platform;

import com.maskan.platform.domain.entity.Booking;
import com.maskan.platform.domain.entity.Property;
import com.maskan.platform.domain.enums.BookingStatus;
import com.maskan.platform.repository.BookingRepository;
import com.maskan.platform.repository.PropertyRepository;
import com.maskan.platform.service.AuditService;
import com.maskan.platform.service.BookingService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class BookingServiceTest {

    @Mock private BookingRepository bookingRepository;
    @Mock private PropertyRepository propertyRepository;
    @Mock private AuditService auditService;
    @InjectMocks private BookingService bookingService;

    @Test
    void undoRestoresPreviousStatusCleanly() {
        UUID id = UUID.randomUUID();
        Property prop = Property.builder().id(UUID.randomUUID()).code("p1")
            .nameAr("شقة").nameFr("Appartement").pricePerNightUsd(BigDecimal.valueOf(140)).build();
        Booking booking = Booking.builder().id(id).bookingCode("BK-403").property(prop)
            .guestName("Karim").guestPhone("+212661309214")
            .checkIn(LocalDate.of(2026, 11, 28)).checkOut(LocalDate.of(2026, 12, 1))
            .nights(3).totalUsd(BigDecimal.valueOf(375))
            .status(BookingStatus.CONFIRMED).previousStatus(BookingStatus.PENDING).build();

        when(bookingRepository.findById(id)).thenReturn(Optional.of(booking));
        when(bookingRepository.saveAndFlush(any(Booking.class))).thenAnswer(inv -> inv.getArgument(0));

        var result = bookingService.undoLastStatusChange(id);
        assertThat(result.status()).isEqualTo(BookingStatus.PENDING);
        assertThat(result.previousStatus()).isNull();
    }
}
