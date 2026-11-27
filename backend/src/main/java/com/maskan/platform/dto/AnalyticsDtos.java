package com.maskan.platform.dto;

import java.math.BigDecimal;
import java.util.List;

public final class AnalyticsDtos {
    private AnalyticsDtos() {}

    public record MonthlyRevenuePoint(
        String monthKey,
        BigDecimal apartmentUsd,
        BigDecimal houseUsd,
        BigDecimal totalUsd
    ) {}

    public record PropertyRevenueBreakdown(
        String propertyCode,
        String nameAr,
        String nameFr,
        long bookingsCount,
        BigDecimal revenueUsd
    ) {}

    public record DashboardSummaryResponse(
        long totalUnits,
        long apartmentCount,
        long houseCount,
        long availableNow,
        double occupancyRate,
        long activeBookings,
        long pendingRequests,
        BigDecimal totalRevenueUsd,
        double revenueGrowthPct,
        List<MonthlyRevenuePoint> monthlyRevenue,
        List<PropertyRevenueBreakdown> propertyBreakdown
    ) {}
}
