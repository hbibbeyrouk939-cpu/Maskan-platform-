package com.maskan.platform.controller;

import com.maskan.platform.dto.AuthDtos.*;
import com.maskan.platform.service.AuthService;
import com.maskan.platform.service.OtpService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
@Tag(name = "Authentication & OTP")
public class AuthController {
    private final AuthService authService;
    private final OtpService otpService;

    @PostMapping("/otp/request")
    @Operation(summary = "Send a 6-digit OTP code via SMS (E.164 country phone) or Email")
    public RequestOtpResponse requestOtp(@Valid @RequestBody RequestOtpRequest request) {
        return otpService.requestOtp(request);
    }

    @PostMapping("/register")
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Register a new account after verifying the 6-digit SMS or Email OTP")
    public AuthResponse register(@Valid @RequestBody RegisterRequest request) {
        return authService.register(request);
    }

    @PostMapping("/login")
    @Operation(summary = "Authenticate with email and password")
    public AuthResponse login(@Valid @RequestBody LoginRequest request) {
        return authService.login(request);
    }

    @PostMapping("/login/otp")
    @Operation(summary = "Authenticate passwordlessly with a 6-digit SMS or Email OTP")
    public AuthResponse loginWithOtp(@Valid @RequestBody OtpLoginRequest request) {
        return authService.loginWithOtp(request);
    }

    @PostMapping("/refresh")
    @Operation(summary = "Rotate refresh token and issue a fresh JWT access token")
    public AuthResponse refresh(@Valid @RequestBody RefreshRequest request) {
        return authService.refresh(request);
    }
}
