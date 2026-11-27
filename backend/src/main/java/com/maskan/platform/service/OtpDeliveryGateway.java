package com.maskan.platform.service;

import com.maskan.platform.domain.enums.OtpChannel;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

@Slf4j
@Component
public class OtpDeliveryGateway {

    @Value("${maskan.otp.provider:log}")
    private String provider;

    public void deliver(OtpChannel channel, String destination, String code, String lang) {
        String message = "fr".equalsIgnoreCase(lang)
            ? "Maskan — Votre code de vérification est : " + code + " (valable 5 min)."
            : "مَسْكَن — رمز التحقق الخاص بك هو: " + code + " (صالح لمدة 5 دقائق).";

        // Production integrations (Twilio / Vonage / SMTP) plug in here when OTP_PROVIDER != log
        log.info("[OTP:{} via {}] -> {} | {}", channel, provider, mask(destination, channel), message);
    }

    public static String mask(String destination, OtpChannel channel) {
        if (channel == OtpChannel.EMAIL && destination.contains("@")) {
            String[] parts = destination.split("@", 2);
            String local = parts[0];
            String visible = local.length() <= 2 ? local.substring(0, 1) : local.substring(0, 2);
            return visible + "***@" + parts[1];
        }
        if (destination.length() > 6) {
            return destination.substring(0, 4) + "****" + destination.substring(destination.length() - 2);
        }
        return "****";
    }
}
