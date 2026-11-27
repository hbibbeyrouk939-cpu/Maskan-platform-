package com.maskan.platform.domain.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.Instant;

@Entity
@Table(name = "exchange_rates")
@Getter @Setter @Builder @NoArgsConstructor @AllArgsConstructor
public class ExchangeRate {
    @Id
    @Column(length = 8)
    private String code;

    @Column(name = "name_ar", nullable = false, length = 80)
    private String nameAr;

    @Column(name = "name_fr", nullable = false, length = 80)
    private String nameFr;

    @Column(name = "symbol_ar", nullable = false, length = 16)
    private String symbolAr;

    @Column(name = "symbol_fr", nullable = false, length = 16)
    private String symbolFr;

    @Column(name = "rate_to_usd", nullable = false, precision = 12, scale = 4)
    private BigDecimal rateToUsd;

    @Column(name = "is_prefix", nullable = false)
    private boolean prefix;

    @Column(name = "updated_at", nullable = false)
    @Builder.Default
    private Instant updatedAt = Instant.now();
}
