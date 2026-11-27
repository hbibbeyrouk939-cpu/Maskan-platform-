package com.maskan.platform.repository;

import com.maskan.platform.domain.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface UserRepository extends JpaRepository<User, UUID> {
    Optional<User> findByEmailIgnoreCase(String email);
    Optional<User> findByPhoneE164(String phoneE164);
    boolean existsByEmailIgnoreCase(String email);
    boolean existsByPhoneE164(String phoneE164);
}
