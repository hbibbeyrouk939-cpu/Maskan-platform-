package com.maskan.platform.service;

import com.maskan.platform.domain.entity.OtpVerification;
import com.maskan.platform.domain.enums.OtpChannel;
import com.maskan.platform.domain.enums.OtpPurpose;
import com.maskan.platform.dto.AuthDtos.RequestOtpRequest;
import com.maskan.platform.dto.AuthDtos.RequestOtpResponse;
import com.maskan.platform.exception.MaskanException;
import com.maskan.platform.repository.OtpVerificationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.i18n.LocaleContextHolder;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.SecureRandom;
import java.time.Duration;
import java.time.Instant;
import java.util.HexFormat;
import java.util.regex.Pattern;

@Service
@RequiredArgsConstructor
public class OtpService {
    private static final SecureRandom RANDOM = new SecureRandom();
    private static final Pattern E164_PATTERN = Pattern.compile("^\\+[1-9]\\d{6,14}$");
    private static final Pattern EMAIL_PATTERN = Pattern.compile("^[^@\\s]+@[^@\\s]+\\.[^@\\s]+$");

    private final OtpVerificationRepository otpRepository;
    private final OtpDeliveryGateway deliveryGateway;

    @Value("${maskan.otp.ttl-seconds:300}")
    private long ttlSeconds = 300;

    @Value("${maskan.otp.cooldown-seconds:45}")
    private long cooldownSeconds = 45;

    @Value("${maskan.otp.max-attempts:5}")
    private int maxAttempts = 5;

    @Value("${maskan.otp.expose-dev-code:false}")
    private boolean exposeDevCode = false;

    @Transactional
    public RequestOtpResponse requestOtp(RequestOtpRequest req) {
        String normalized = normalizeDestination(req.destination(), req.channel());

        otpRepository.findTopByDestinationAndChannelAndPurposeAndConsumedFalseOrderByCreatedAtDesc(
            normalized, req.channel(), req.purpose()
        ).ifPresent(existing -> {
            long elapsed = Duration.between(existing.getCreatedAt(), Instant.now()).getSeconds();
            if (elapsed < cooldownSeconds) {
                throw new MaskanException(
                    HttpStatus.TOO_MANY_REQUESTS,
                    "error.title.validation",
                    "error.otp.cooldown",
                    cooldownSeconds - elapsed
                );
            }
            existing.setConsumed(true);
            otpRepository.save(existing);
        });

        String code = String.format("%06d", RANDOM.nextInt(1_000_000));
        otpRepository.save(OtpVerification.builder()
            .destination(normalized)
            .channel(req.channel())
            .purpose(req.purpose())
            .codeHash(sha256(code))
            .expiresAt(Instant.now().plusSeconds(ttlSeconds))
            .build());

        String lang = LocaleContextHolder.getLocale().getLanguage();
        deliveryGateway.deliver(req.channel(), normalized, code, lang);

        return new RequestOtpResponse(
            OtpDeliveryGateway.mask(normalized, req.channel()),
            req.channel(),
            ttlSeconds,
            cooldownSeconds,
            exposeDevCode ? code : null
        );
    }

    @Transactional
    public void verifyAndConsume(String rawDestination, OtpChannel channel, OtpPurpose purpose, String code) {
        String normalized = normalizeDestination(rawDestination, channel);
        OtpVerification otp = otpRepository
            .findTopByDestinationAndChannelAndPurposeAndConsumedFalseOrderByCreatedAtDesc(normalized, channel, purpose)
            .orElseThrow(() -> new MaskanException(HttpStatus.BAD_REQUEST, "error.title.validation", "error.otp.invalid"));

        if (otp.getExpiresAt().isBefore(Instant.now())) {
            otp.setConsumed(true);
            otpRepository.save(otp);
            throw new MaskanException(HttpStatus.BAD_REQUEST, "error.title.validation", "error.otp.expired");
        }
        if (otp.getAttempts() >= maxAttempts) {
            otp.setConsumed(true);
            otpRepository.save(otp);
            throw new MaskanException(HttpStatus.TOO_MANY_REQUESTS, "error.title.validation", "error.otp.too_many_attempts");
        }

        if (!otp.getCodeHash().equals(sha256(code))) {
            otp.setAttempts(otp.getAttempts() + 1);
            otpRepository.save(otp);
            throw new MaskanException(HttpStatus.BAD_REQUEST, "error.title.validation", "error.otp.invalid");
        }

        otp.setConsumed(true);
        otpRepository.save(otp);
    }

    public static String normalizeDestination(String destination, OtpChannel channel) {
        String trimmed = destination == null ? "" : destination.trim();
        if (channel == OtpChannel.EMAIL) {
            String lower = trimmed.toLowerCase();
            if (!EMAIL_PATTERN.matcher(lower).matches()) {
                throw new MaskanException(HttpStatus.BAD_REQUEST, "error.title.validation", "error.otp.invalid_destination");
            }
            return lower;
        }
        String digits = trimmed.replaceAll("[\\s()-]", "");
        if (!E164_PATTERN.matcher(digits).matches()) {
            throw new MaskanException(HttpStatus.BAD_REQUEST, "error.title.validation", "error.otp.invalid_destination");
        }
        return digits;
    }

    public static String sha256(String value) {
        try {
            MessageDigest md = MessageDigest.getInstance("SHA-256");
            return HexFormat.of().formatHex(md.digest(value.getBytes(StandardCharsets.UTF_8)));
        } catch (Exception e) {
            throw new IllegalStateException("SHA-256 unavailable", e);
        }
    }
}
