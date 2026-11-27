package com.maskan.platform.service;

import com.maskan.platform.domain.entity.User;
import com.maskan.platform.dto.AuthDtos.UserProfileDto;
import com.maskan.platform.dto.UserPreferencesDto;
import com.maskan.platform.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class UserPreferenceService {
    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public UserProfileDto getProfile(UUID userId) {
        return AuthService.toProfileDto(userRepository.findById(userId).orElseThrow());
    }

    @Transactional
    public UserProfileDto updatePreferences(UUID userId, UserPreferencesDto dto) {
        User user = userRepository.findById(userId).orElseThrow();
        if (dto.preferredLang() != null) user.setPreferredLang(dto.preferredLang());
        if (dto.preferredTheme() != null) user.setPreferredTheme(dto.preferredTheme());
        if (dto.preferredCurrency() != null) user.setPreferredCurrency(dto.preferredCurrency());
        return AuthService.toProfileDto(userRepository.save(user));
    }
}
