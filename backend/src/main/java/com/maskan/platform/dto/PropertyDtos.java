package com.maskan.platform.dto;

import com.maskan.platform.domain.enums.PropertyStatus;
import com.maskan.platform.domain.enums.PropertyType;
import jakarta.validation.constraints.*;

import java.math.BigDecimal;
import java.util.UUID;

public final class PropertyDtos {
    private PropertyDtos() {}

    public record PropertyResponse(
        UUID id,
        String code,
        String nameAr,
        String nameFr,
        PropertyType type,
        String districtAr,
        String districtFr,
        int rooms,
        int areaSqm,
        BigDecimal pricePerNightUsd,
        PropertyStatus status,
        String imageKey,
        String imageUrl
    ) {}

    public record UpsertPropertyRequest(
        @NotBlank @Size(max = 180) String nameAr,
        @NotBlank @Size(max = 180) String nameFr,
        @NotNull PropertyType type,
        @NotBlank @Size(max = 180) String districtAr,
        @NotBlank @Size(max = 180) String districtFr,
        @Min(1) @Max(50) int rooms,
        @Min(15) @Max(10000) int areaSqm,
        @NotNull @DecimalMin("10.00") BigDecimal pricePerNightUsd,
        @NotNull PropertyStatus status,
        @NotBlank String imageKey
    ) {}
}
