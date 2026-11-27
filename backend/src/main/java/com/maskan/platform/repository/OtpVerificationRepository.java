package com.maskan.platform.repository;

import com.maskan.platform.domain.entity.OtpVerification;
import com.maskan.platform.domain.enums.OtpChannel;
import com.maskan.platform.domain.enums.OtpPurpose;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface OtpVerificationRepository extends JpaRepository<OtpVerification, UUID> {
    Optional<OtpVerification> findTopByDestinationAndChannelAndPurposeAndConsumedFalseOrderByCreatedAtDesc(
        String destination, OtpChannel channel, OtpPurpose purpose
    );
}
