package com.maskan.platform.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.util.Date;
import java.util.Map;
import java.util.UUID;

@Service
public class JwtService {
    private final SecretKey signingKey;
    private final long accessExpirationMs;
    private final long refreshExpirationMs;

    public JwtService(
        @Value("${maskan.security.jwt.secret}") String base64Secret,
        @Value("${maskan.security.jwt.access-expiration-ms}") long accessExpirationMs,
        @Value("${maskan.security.jwt.refresh-expiration-ms}") long refreshExpirationMs
    ) {
        this.signingKey = Keys.hmacShaKeyFor(Decoders.BASE64.decode(base64Secret));
        this.accessExpirationMs = accessExpirationMs;
        this.refreshExpirationMs = refreshExpirationMs;
    }

    public String generateAccessToken(UserPrincipal principal) {
        Date now = new Date();
        return Jwts.builder()
            .subject(principal.getEmail())
            .claims(Map.of("uid", principal.getId().toString(), "role", principal.getRole()))
            .issuedAt(now)
            .expiration(new Date(now.getTime() + accessExpirationMs))
            .signWith(signingKey)
            .compact();
    }

    public String generateRefreshTokenValue() {
        return UUID.randomUUID() + "." + UUID.randomUUID();
    }

    public Claims parseClaims(String token) {
        return Jwts.parser().verifyWith(signingKey).build().parseSignedClaims(token).getPayload();
    }

    public String extractEmail(String token) {
        return parseClaims(token).getSubject();
    }

    public long getAccessExpirationMs() { return accessExpirationMs; }
    public long getRefreshExpirationMs() { return refreshExpirationMs; }
}
