package com.maskan.platform.service;

import com.maskan.platform.domain.entity.Booking;
import com.maskan.platform.domain.entity.Property;
import com.maskan.platform.domain.enums.BookingStatus;
import com.maskan.platform.domain.enums.PropertyStatus;
import com.maskan.platform.domain.enums.PropertyType;
import com.maskan.platform.dto.AnalyticsDtos.*;
import com.maskan.platform.repository.BookingRepository;
import com.maskan.platform.repository.PropertyRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.YearMonth;
import java.util.*;

@Service
@RequiredArgsConstructor
public class AnalyticsService {
    private final PropertyRepository propertyRepository;
    private final BookingRepository bookingRepository;

    @Transactional(readOnly = true)
    public DashboardSummaryResponse getSummary() {
        List<Property> properties = propertyRepository.findAllByActiveTrueOrderByCreatedAtAsc();
        List<Booking> allBookings = bookingRepository.findAllWithProperty();

        long totalUnits = properties.size();
        long apartmentCount = properties.stream().filter(p -> p.getType() == PropertyType.APARTMENT).count();
        long houseCount = properties.stream().filter(p -> p.getType() == PropertyType.HOUSE).count();
        long availableNow = properties.stream().filter(p -> p.getStatus() == PropertyStatus.AVAILABLE).count();
        long occupiedCount = properties.stream().filter(p -> p.getStatus() == PropertyStatus.OCCUPIED).count();
        double occupancyRate = totalUnits > 0 ? Math.round((occupiedCount * 1000.0) / totalUnits) / 10.0 : 0.0;

        long activeBookings = allBookings.stream().filter(b -> b.getStatus() == BookingStatus.CONFIRMED).count();
        long pendingRequests = allBookings.stream().filter(b -> b.getStatus() == BookingStatus.PENDING).count();

        List<Booking> eligible = allBookings.stream()
            .filter(b -> b.getStatus() == BookingStatus.CONFIRMED || b.getStatus() == BookingStatus.COMPLETED)
            .toList();

        BigDecimal totalRevenueUsd = eligible.stream()
            .map(Booking::getTotalUsd)
            .reduce(BigDecimal.ZERO, BigDecimal::add);

        List<YearMonth> months = List.of(
            YearMonth.of(2026, 6), YearMonth.of(2026, 7), YearMonth.of(2026, 8),
            YearMonth.of(2026, 9), YearMonth.of(2026, 10), YearMonth.of(2026, 11)
        );

        List<MonthlyRevenuePoint> monthlyPoints = new ArrayList<>();
        for (YearMonth ym : months) {
            BigDecimal apt = eligible.stream()
                .filter(b -> YearMonth.from(b.getCheckIn()).equals(ym) && b.getProperty().getType() == PropertyType.APARTMENT)
                .map(Booking::getTotalUsd).reduce(BigDecimal.ZERO, BigDecimal::add);
            BigDecimal house = eligible.stream()
                .filter(b -> YearMonth.from(b.getCheckIn()).equals(ym) && b.getProperty().getType() == PropertyType.HOUSE)
                .map(Booking::getTotalUsd).reduce(BigDecimal.ZERO, BigDecimal::add);
            monthlyPoints.add(new MonthlyRevenuePoint(ym.toString(), apt, house, apt.add(house)));
        }

        double growthPct = 0.0;
        if (monthlyPoints.size() >= 2) {
            BigDecimal prev = monthlyPoints.get(monthlyPoints.size() - 2).totalUsd();
            BigDecimal curr = monthlyPoints.get(monthlyPoints.size() - 1).totalUsd();
            if (prev.compareTo(BigDecimal.ZERO) > 0) {
                growthPct = Math.round(((curr.doubleValue() - prev.doubleValue()) / prev.doubleValue()) * 1000.0) / 10.0;
            }
        }

        List<PropertyRevenueBreakdown> breakdown = properties.stream().map(p -> {
            List<Booking> pBookings = eligible.stream().filter(b -> b.getProperty().getId().equals(p.getId())).toList();
            BigDecimal rev = pBookings.stream().map(Booking::getTotalUsd).reduce(BigDecimal.ZERO, BigDecimal::add);
            return new PropertyRevenueBreakdown(p.getCode(), p.getNameAr(), p.getNameFr(), pBookings.size(), rev);
        }).toList();

        return new DashboardSummaryResponse(
            totalUnits, apartmentCount, houseCount, availableNow, occupancyRate,
            activeBookings, pendingRequests, totalRevenueUsd, growthPct,
            monthlyPoints, breakdown
        );
    }
}
