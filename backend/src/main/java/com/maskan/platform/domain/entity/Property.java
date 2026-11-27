package com.maskan.platform.domain.entity;

import com.maskan.platform.domain.enums.PropertyStatus;
import com.maskan.platform.domain.enums.PropertyType;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "properties")
@Getter @Setter @Builder @NoArgsConstructor @AllArgsConstructor
public class Property {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false, unique = true, length = 32)
    private String code;

    @Column(name = "name_ar", nullable = false, length = 180)
    private String nameAr;

    @Column(name = "name_fr", nullable = false, length = 180)
    private String nameFr;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 32)
    private PropertyType type;

    @Column(name = "district_ar", nullable = false, length = 180)
    private String districtAr;

    @Column(name = "district_fr", nullable = false, length = 180)
    private String districtFr;

    @Column(nullable = false)
    private int rooms;

    @Column(name = "area_sqm", nullable = false)
    private int areaSqm;

    @Column(name = "price_per_night_usd", nullable = false, precision = 10, scale = 2)
    private BigDecimal pricePerNightUsd;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 32)
    @Builder.Default
    private PropertyStatus status = PropertyStatus.AVAILABLE;

    @Column(name = "image_key", nullable = false, length = 32)
    @Builder.Default
    private String imageKey = "img1";

    @Column(name = "image_url", nullable = false, length = 255)
    @Builder.Default
    private String imageUrl = "/assets/property-01.webp";

    @Column(nullable = false)
    @Builder.Default
    private boolean active = true;

    @Column(name = "created_at", nullable = false, updatable = false)
    @Builder.Default
    private Instant createdAt = Instant.now();

    @Column(name = "updated_at", nullable = false)
    @Builder.Default
    private Instant updatedAt = Instant.now();

    @PreUpdate
    void onUpdate() { this.updatedAt = Instant.now(); }
}
