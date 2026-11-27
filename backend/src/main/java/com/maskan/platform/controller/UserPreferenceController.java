package com.maskan.platform.controller;

import com.maskan.platform.dto.AuthDtos.UserProfileDto;
import com.maskan.platform.dto.UserPreferencesDto;
import com.maskan.platform.security.UserPrincipal;
import com.maskan.platform.service.UserPreferenceService;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/me")
@RequiredArgsConstructor
@Tag(name = "User Preferences")
public class UserPreferenceController {
    private final UserPreferenceService preferenceService;

    @GetMapping
    public UserProfileDto getMe(@AuthenticationPrincipal UserPrincipal principal) {
        return preferenceService.getProfile(principal.getId());
    }

    @PatchMapping("/preferences")
    public UserProfileDto updatePreferences(
        @AuthenticationPrincipal UserPrincipal principal,
        @Valid @RequestBody UserPreferencesDto dto
    ) {
        return preferenceService.updatePreferences(principal.getId(), dto);
    }
}
