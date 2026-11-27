package com.maskan.platform.repository;

import com.maskan.platform.domain.entity.Booking;
import com.maskan.platform.domain.enums.BookingStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface BookingRepository extends JpaRepository<Booking, UUID> {
    @Query("SELECT b FROM Booking b JOIN FETCH b.property ORDER BY b.checkIn DESC")
    List<Booking> findAllWithProperty();

    @Query("SELECT b FROM Booking b JOIN FETCH b.property WHERE b.status = :status ORDER BY b.checkIn DESC")
    List<Booking> findByStatusWithProperty(@Param("status") BookingStatus status);

    @Query("""
        SELECT COUNT(b) > 0 FROM Booking b
        WHERE b.property.id = :propertyId
          AND b.status IN ('CONFIRMED', 'PENDING')
          AND b.checkIn < :checkOut
          AND b.checkOut > :checkIn
        """)
    boolean existsOverlappingActiveBooking(
        @Param("propertyId") UUID propertyId,
        @Param("checkIn") LocalDate checkIn,
        @Param("checkOut") LocalDate checkOut
    );

    Optional<Booking> findByBookingCode(String bookingCode);

    @Query("SELECT b FROM Booking b JOIN FETCH b.property WHERE b.status IN ('CONFIRMED', 'COMPLETED')")
    List<Booking> findRevenueEligibleBookings();
}
