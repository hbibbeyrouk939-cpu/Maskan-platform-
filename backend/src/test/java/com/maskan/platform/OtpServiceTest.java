package com.maskan.platform;

import com.maskan.platform.domain.entity.OtpVerification;
import com.maskan.platform.domain.enums.OtpChannel;
import com.maskan.platform.domain.enums.OtpPurpose;
import com.maskan.platform.exception.MaskanException;
import com.maskan.platform.repository.OtpVerificationRepository;
import com.maskan.platform.service.OtpDeliveryGateway;
import com.maskan.platform.service.OtpService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.Instant;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class OtpServiceTest {

    @Mock private OtpVerificationRepository otpRepository;
    @Mock private OtpDeliveryGateway deliveryGateway;
    @InjectMocks private OtpService otpService;

    @Test
    void verifiesValidCodeAndMarksConsumed() {
        String code = "482915";
        OtpVerification record = OtpVerification.builder()
            .destination("+22236441209")
            .channel(OtpChannel.SMS)
            .purpose(OtpPurpose.REGISTER)
            .codeHash(OtpService.sha256(code))
            .expiresAt(Instant.now().plusSeconds(180))
            .attempts(0)
            .consumed(false)
            .build();

        when(otpRepository.findTopByDestinationAndChannelAndPurposeAndConsumedFalseOrderByCreatedAtDesc(
            "+22236441209", OtpChannel.SMS, OtpPurpose.REGISTER
        )).thenReturn(Optional.of(record));
        when(otpRepository.save(any(OtpVerification.class))).thenAnswer(inv -> inv.getArgument(0));

        otpService.verifyAndConsume("+222 36 44 12 09", OtpChannel.SMS, OtpPurpose.REGISTER, code);
        assertThat(record.isConsumed()).isTrue();
    }

    @Test
    void rejectsExpiredOtp() {
        OtpVerification expired = OtpVerification.builder()
            .destination("guest@maskan.mr")
            .channel(OtpChannel.EMAIL)
            .purpose(OtpPurpose.LOGIN)
            .codeHash(OtpService.sha256("123456"))
            .expiresAt(Instant.now().minusSeconds(10))
            .build();

        when(otpRepository.findTopByDestinationAndChannelAndPurposeAndConsumedFalseOrderByCreatedAtDesc(
            "guest@maskan.mr", OtpChannel.EMAIL, OtpPurpose.LOGIN
        )).thenReturn(Optional.of(expired));

        assertThatThrownBy(() -> otpService.verifyAndConsume("guest@maskan.mr", OtpChannel.EMAIL, OtpPurpose.LOGIN, "123456"))
            .isInstanceOf(MaskanException.class);
    }
}
