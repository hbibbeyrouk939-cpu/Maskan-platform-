package com.maskan.platform.service;

import com.maskan.platform.domain.entity.AuditLog;
import com.maskan.platform.repository.AuditLogRepository;
import com.maskan.platform.security.UserPrincipal;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AuditService {
    private final AuditLogRepository auditLogRepository;

    public void record(String action, String entityType, String entityId, Map<String, Object> payload) {
        UUID actorId = null;
        String actorEmail = "system@maskan.mr";
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.getPrincipal() instanceof UserPrincipal principal) {
            actorId = principal.getId();
            actorEmail = principal.getEmail();
        }
        auditLogRepository.save(AuditLog.builder()
            .actorId(actorId)
            .actorEmail(actorEmail)
            .action(action)
            .entityType(entityType)
            .entityId(entityId)
            .payload(payload == null ? Map.of() : payload)
            .build());
    }
}
