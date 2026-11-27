-- Add phone/country verification fields to users and create otp_verifications table

ALTER TABLE users
    ADD COLUMN IF NOT EXISTS phone_e164 VARCHAR(32) UNIQUE,
    ADD COLUMN IF NOT EXISTS country_code VARCHAR(4) NOT NULL DEFAULT 'MR',
    ADD COLUMN IF NOT EXISTS email_verified BOOLEAN NOT NULL DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS phone_verified BOOLEAN NOT NULL DEFAULT FALSE;

UPDATE users SET email_verified = TRUE WHERE email IN ('admin@maskan.mr', 'concierge@maskan.mr');

CREATE TABLE otp_verifications (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    destination VARCHAR(180) NOT NULL,
    channel     VARCHAR(16)  NOT NULL,
    purpose     VARCHAR(32)  NOT NULL,
    code_hash   VARCHAR(255) NOT NULL,
    expires_at  TIMESTAMPTZ  NOT NULL,
    attempts    INTEGER      NOT NULL DEFAULT 0,
    consumed    BOOLEAN      NOT NULL DEFAULT FALSE,
    created_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    CONSTRAINT chk_otp_channel CHECK (channel IN ('SMS', 'EMAIL')),
    CONSTRAINT chk_otp_purpose CHECK (purpose IN ('REGISTER', 'LOGIN'))
);

CREATE INDEX idx_otp_lookup ON otp_verifications(destination, channel, purpose, consumed);
CREATE INDEX idx_otp_expires_at ON otp_verifications(expires_at);
