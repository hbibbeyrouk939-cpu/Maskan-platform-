package com.maskan.platform;

import com.maskan.platform.domain.entity.Property;
import com.maskan.platform.domain.enums.BookingStatus;
import com.maskan.platform.dto.BookingDtos.CreateBookingRequest;
import com.maskan.platform.exception.BookingConflictException;
import com.maskan.platform.repository.PropertyRepository;
import com.maskan.platform.service.BookingService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

import java.time.LocalDate;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

@SpringBootTest
@Testcontainers(disabledWithoutDocker = true)
class BookingConflictIntegrationTest {

    @Container
    static PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:16-alpine")
        .withDatabaseName("maskan_test")
        .withUsername("maskan")
        .withPassword("maskan_test");

    @DynamicPropertySource
    static void registerProps(DynamicPropertyRegistry registry) {
        registry.add("spring.datasource.url", postgres::getJdbcUrl);
        registry.add("spring.datasource.username", postgres::getUsername);
        registry.add("spring.datasource.password", postgres::getPassword);
    }

    @Autowired
    private BookingService bookingService;

    @Autowired
    private PropertyRepository propertyRepository;

    @Test
    void rejectsOverlappingBookingAndCalculatesTotalServerSide() {
        Property prop = propertyRepository.findAllByActiveTrueOrderByCreatedAtAsc().getFirst();

        var created = bookingService.create(new CreateBookingRequest(
            prop.getId(), "Sidi Mohamed", "+222 36 00 11 22",
            LocalDate.of(2027, 1, 10), LocalDate.of(2027, 1, 14),
            BookingStatus.CONFIRMED, "VIP arrival"
        ), null);

        assertThat(created.nights()).isEqualTo(4);
        assertThat(created.totalUsd()).isEqualByComparingTo(prop.getPricePerNightUsd().multiply(java.math.BigDecimal.valueOf(4)));

        assertThatThrownBy(() -> bookingService.create(new CreateBookingRequest(
            prop.getId(), "Overlapping Guest", "+222 44 11 22 33",
            LocalDate.of(2027, 1, 12), LocalDate.of(2027, 1, 16),
            BookingStatus.PENDING, null
        ), null)).isInstanceOf(BookingConflictException.class);
    }
}
