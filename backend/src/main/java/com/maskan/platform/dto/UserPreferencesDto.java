package com.maskan.platform.dto;

import jakarta.validation.constraints.Pattern;

public record UserPreferencesDto(
    @Pattern(regexp = "ar|fr") String preferredLang,
    @Pattern(regexp = "light|dark") String preferredTheme,
    @Pattern(regexp = "USD|EUR|MRU") String preferredCurrency
) {}
