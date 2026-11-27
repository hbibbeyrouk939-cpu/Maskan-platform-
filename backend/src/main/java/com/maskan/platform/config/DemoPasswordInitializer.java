package com.maskan.platform.config;

import com.maskan.platform.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
@RequiredArgsConstructor
public class DemoPasswordInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${maskan.seed.sync-demo-passwords:true}")
    private boolean syncDemoPasswords;

    @Override
    public void run(String... args) {
        if (!syncDemoPasswords) return;
        for (String email : List.of("admin@maskan.mr", "concierge@maskan.mr")) {
            userRepository.findByEmailIgnoreCase(email).ifPresent(user -> {
                if (!passwordEncoder.matches("Maskan2026!", user.getPasswordHash())) {
                    user.setPasswordHash(passwordEncoder.encode("Maskan2026!"));
                    userRepository.save(user);
                }
            });
        }
    }
}
