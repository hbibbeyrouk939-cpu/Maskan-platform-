package com.maskan.platform.dto;

import com.maskan.platform.domain.enums.OtpChannel;
import com.maskan.platform.domain.enums.OtpPurpose;
import jakarta.validation.constraints.*;

import java.util.UUID;

public final class AuthDtos {
    private AuthDtos() {}

    public record LoginRequest(
        @NotBlank @Email String email,
        @NotBlank String password
    ) {}

    public record OtpLoginRequest(
        @NotNull OtpChannel channel,
        @NotBlank String destination,
        @NotBlank @Pattern(regexp = "\\d{6}") String otpCode
    ) {}

    public record RequestOtpRequest(
        @NotNull OtpChannel channel,
        @NotBlank @Size(max = 180) String destination,
        @Size(max = 4) String countryCode,
        @NotNull OtpPurpose purpose
    ) {}

    public record RequestOtpResponse(
        String maskedDestination,
        OtpChannel channel,
        long expiresInSeconds,
        long resendCooldownSeconds,
        String devPreviewCode
    ) {}

    public record RegisterRequest(
        @NotBlank @Size(min = 2, max = 140) String fullName,
        @NotBlank @Email @Size(max = 180) String email,
        @NotBlank @Pattern(regexp = "^\\+[1-9]\\d{6,14}$") String phoneE164,
        @NotBlank @Size(min = 2, max = 4) String countryCode,
        @NotBlank @Size(min = 8, max = 128) String password,
        @NotNull OtpChannel verificationChannel,
        @NotBlank @Pattern(regexp = "^\\d{6}$") String otpCode
    ) {}

    public record RefreshRequest(@NotBlank String refreshToken) {}

    public record UserProfileDto(
        UUID id,
        String email,
        String phoneE164,
        String countryCode,
        String fullName,
        String role,
        boolean emailVerified,
        boolean phoneVerified,
        String preferredLang,
        String preferredTheme,
        String preferredCurrency
    ) {}

    public record AuthResponse(
        String accessToken,
        String refreshToken,
        long expiresInMs,
        UserProfileDto user
    ) {}
}
