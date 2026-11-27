package com.maskan.platform.domain.entity;

import com.maskan.platform.domain.enums.Role;
import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "users")
@Getter @Setter @Builder @NoArgsConstructor @AllArgsConstructor
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false, unique = true, length = 180)
    private String email;

    @Column(name = "phone_e164", unique = true, length = 32)
    private String phoneE164;

    @Column(name = "country_code", nullable = false, length = 4)
    @Builder.Default
    private String countryCode = "MR";

    @Column(name = "password_hash", nullable = false)
    private String passwordHash;

    @Column(name = "full_name", nullable = false, length = 140)
    private String fullName;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 32)
    private Role role;

    @Column(name = "email_verified", nullable = false)
    @Builder.Default
    private boolean emailVerified = false;

    @Column(name = "phone_verified", nullable = false)
    @Builder.Default
    private boolean phoneVerified = false;

    @Column(name = "preferred_lang", nullable = false, length = 8)
    @Builder.Default
    private String preferredLang = "ar";

    @Column(name = "preferred_theme", nullable = false, length = 16)
    @Builder.Default
    private String preferredTheme = "light";

    @Column(name = "preferred_currency", nullable = false, length = 8)
    @Builder.Default
    private String preferredCurrency = "USD";

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
