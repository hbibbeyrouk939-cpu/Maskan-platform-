package com.maskan.platform.service;

import com.maskan.platform.domain.entity.RefreshToken;
import com.maskan.platform.domain.entity.User;
import com.maskan.platform.domain.enums.OtpChannel;
import com.maskan.platform.domain.enums.OtpPurpose;
import com.maskan.platform.domain.enums.Role;
import com.maskan.platform.dto.AuthDtos.*;
import com.maskan.platform.exception.MaskanException;
import com.maskan.platform.repository.RefreshTokenRepository;
import com.maskan.platform.repository.UserRepository;
import com.maskan.platform.security.JwtService;
import com.maskan.platform.security.UserPrincipal;
import lombok.RequiredArgsConstructor;
import org.springframework.context.i18n.LocaleContextHolder;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class AuthService {
    private final AuthenticationManager authenticationManager;
    private final UserRepository userRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final JwtService jwtService;
    private final PasswordEncoder passwordEncoder;
    private final OtpService otpService;
    private final AuditService auditService;

    @Transactional
    public AuthResponse register(RegisterRequest req) {
        String email = req.email().trim().toLowerCase();
        String phone = req.phoneE164().replaceAll("[\\s()-]", "");

        if (userRepository.existsByEmailIgnoreCase(email)) {
            throw new MaskanException(HttpStatus.CONFLICT, "error.title.conflict", "error.auth.email_exists");
        }
        if (userRepository.existsByPhoneE164(phone)) {
            throw new MaskanException(HttpStatus.CONFLICT, "error.title.conflict", "error.auth.phone_exists");
        }

        String otpTarget = req.verificationChannel() == OtpChannel.SMS ? phone : email;
        otpService.verifyAndConsume(otpTarget, req.verificationChannel(), OtpPurpose.REGISTER, req.otpCode());

        String lang = "fr".equalsIgnoreCase(LocaleContextHolder.getLocale().getLanguage()) ? "fr" : "ar";
        User saved = userRepository.save(User.builder()
            .email(email)
            .phoneE164(phone)
            .countryCode(req.countryCode().toUpperCase())
            .fullName(req.fullName().trim())
            .passwordHash(passwordEncoder.encode(req.password()))
            .role(Role.OWNER)
            .emailVerified(req.verificationChannel() == OtpChannel.EMAIL)
            .phoneVerified(req.verificationChannel() == OtpChannel.SMS)
            .preferredLang(lang)
            .build());

        auditService.record("USER_REGISTERED", "USER", saved.getId().toString(),
            Map.of("channel", req.verificationChannel().name(), "country", saved.getCountryCode()));
        return issueTokenPair(saved);
    }

    @Transactional
    public AuthResponse login(LoginRequest request) {
        authenticationManager.authenticate(
            new UsernamePasswordAuthenticationToken(request.email().trim().toLowerCase(), request.password())
        );
        User user = userRepository.findByEmailIgnoreCase(request.email().trim()).orElseThrow();
        return issueTokenPair(user);
    }

    @Transactional
    public AuthResponse loginWithOtp(OtpLoginRequest request) {
        otpService.verifyAndConsume(request.destination(), request.channel(), OtpPurpose.LOGIN, request.otpCode());
        String normalized = OtpService.normalizeDestination(request.destination(), request.channel());
        User user = (request.channel() == OtpChannel.EMAIL
            ? userRepository.findByEmailIgnoreCase(normalized)
            : userRepository.findByPhoneE164(normalized))
            .orElseThrow(() -> new MaskanException(HttpStatus.UNAUTHORIZED, "error.title.unauthorized", "error.auth.invalid_credentials"));
        return issueTokenPair(user);
    }

    @Transactional
    public AuthResponse refresh(RefreshRequest request) {
        String hash = OtpService.sha256(request.refreshToken());
        RefreshToken stored = refreshTokenRepository.findByTokenHashAndRevokedFalse(hash)
            .filter(rt -> rt.getExpiresAt().isAfter(Instant.now()))
            .orElseThrow(() -> new MaskanException(HttpStatus.UNAUTHORIZED, "error.title.unauthorized", "error.auth.invalid_refresh"));
        stored.setRevoked(true);
        refreshTokenRepository.save(stored);
        return issueTokenPair(stored.getUser());
    }

    private AuthResponse issueTokenPair(User user) {
        UserPrincipal principal = new UserPrincipal(user);
        String accessToken = jwtService.generateAccessToken(principal);
        String rawRefresh = jwtService.generateRefreshTokenValue();
        refreshTokenRepository.save(RefreshToken.builder()
            .user(user)
            .tokenHash(OtpService.sha256(rawRefresh))
            .expiresAt(Instant.now().plusMillis(jwtService.getRefreshExpirationMs()))
            .build());

        return new AuthResponse(accessToken, rawRefresh, jwtService.getAccessExpirationMs(), toProfileDto(user));
    }

    public static UserProfileDto toProfileDto(User u) {
        return new UserProfileDto(
            u.getId(), u.getEmail(), u.getPhoneE164(), u.getCountryCode(),
            u.getFullName(), u.getRole().name(), u.isEmailVerified(), u.isPhoneVerified(),
            u.getPreferredLang(), u.getPreferredTheme(), u.getPreferredCurrency()
        );
    }
}
