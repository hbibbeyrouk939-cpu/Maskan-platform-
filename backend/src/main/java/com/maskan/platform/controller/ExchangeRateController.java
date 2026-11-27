package com.maskan.platform.controller;

import com.maskan.platform.dto.ExchangeRateDto;
import com.maskan.platform.repository.ExchangeRateRepository;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/exchange-rates")
@RequiredArgsConstructor
@Tag(name = "Exchange Rates")
public class ExchangeRateController {
    private final ExchangeRateRepository exchangeRateRepository;

    @GetMapping
    public List<ExchangeRateDto> listRates() {
        return exchangeRateRepository.findAll().stream()
            .map(r -> new ExchangeRateDto(
                r.getCode(), r.getNameAr(), r.getNameFr(),
                r.getSymbolAr(), r.getSymbolFr(), r.getRateToUsd(), r.isPrefix()
            ))
            .toList();
    }
}
