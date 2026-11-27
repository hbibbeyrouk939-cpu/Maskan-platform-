package com.maskan.platform.controller;

import com.maskan.platform.dto.AnalyticsDtos.DashboardSummaryResponse;
import com.maskan.platform.service.AnalyticsService;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/analytics")
@RequiredArgsConstructor
@Tag(name = "Analytics")
public class AnalyticsController {
    private final AnalyticsService analyticsService;

    @GetMapping("/summary")
    public DashboardSummaryResponse getSummary() {
        return analyticsService.getSummary();
    }
}
