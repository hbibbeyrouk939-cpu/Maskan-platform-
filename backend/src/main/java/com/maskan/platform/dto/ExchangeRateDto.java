package com.maskan.platform.dto;

import java.math.BigDecimal;

public record ExchangeRateDto(
    String code,
    String nameAr,
    String nameFr,
    String symbolAr,
    String symbolFr,
    BigDecimal rateToUsd,
    boolean prefix
) {}
