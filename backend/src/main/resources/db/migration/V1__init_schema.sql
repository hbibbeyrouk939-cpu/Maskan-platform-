-- Maskan Platform — Initial PostgreSQL 16 Schema
-- Enforces zero double-bookings at the database engine level via btree_gist EXCLUDE constraint.

CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "btree_gist";

CREATE TABLE users (
    id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email              VARCHAR(180) NOT NULL UNIQUE,
    password_hash      VARCHAR(255) NOT NULL,
    full_name          VARCHAR(140) NOT NULL,
    role               VARCHAR(32)  NOT NULL DEFAULT 'CONCIERGE',
    preferred_lang     VARCHAR(8)   NOT NULL DEFAULT 'ar',
    preferred_theme    VARCHAR(16)  NOT NULL DEFAULT 'light',
    preferred_currency VARCHAR(8)   NOT NULL DEFAULT 'USD',
    active             BOOLEAN      NOT NULL DEFAULT TRUE,
    created_at         TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at         TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    CONSTRAINT chk_users_role CHECK (role IN ('ADMIN', 'CONCIERGE', 'OWNER')),
    CONSTRAINT chk_users_lang CHECK (preferred_lang IN ('ar', 'fr')),
    CONSTRAINT chk_users_theme CHECK (preferred_theme IN ('light', 'dark')),
    CONSTRAINT chk_users_currency CHECK (preferred_currency IN ('USD', 'EUR', 'MRU'))
);

CREATE TABLE refresh_tokens (
    id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id    UUID         NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token_hash VARCHAR(255) NOT NULL UNIQUE,
    expires_at TIMESTAMPTZ  NOT NULL,
    revoked    BOOLEAN      NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_refresh_tokens_user_id ON refresh_tokens(user_id);

CREATE TABLE properties (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code                VARCHAR(32)    NOT NULL UNIQUE,
    name_ar             VARCHAR(180)   NOT NULL,
    name_fr             VARCHAR(180)   NOT NULL,
    type                VARCHAR(32)    NOT NULL,
    district_ar         VARCHAR(180)   NOT NULL,
    district_fr         VARCHAR(180)   NOT NULL,
    rooms               INTEGER        NOT NULL CHECK (rooms > 0 AND rooms <= 50),
    area_sqm            INTEGER        NOT NULL CHECK (area_sqm > 10),
    price_per_night_usd NUMERIC(10, 2) NOT NULL CHECK (price_per_night_usd > 0),
    status              VARCHAR(32)    NOT NULL DEFAULT 'AVAILABLE',
    image_key           VARCHAR(32)    NOT NULL DEFAULT 'img1',
    image_url           VARCHAR(255)   NOT NULL DEFAULT '/assets/property-01.webp',
    active              BOOLEAN        NOT NULL DEFAULT TRUE,
    created_at          TIMESTAMPTZ    NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ    NOT NULL DEFAULT NOW(),
    CONSTRAINT chk_properties_type CHECK (type IN ('APARTMENT', 'HOUSE')),
    CONSTRAINT chk_properties_status CHECK (status IN ('AVAILABLE', 'OCCUPIED', 'MAINTENANCE'))
);

CREATE TABLE bookings (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_code    VARCHAR(32)    NOT NULL UNIQUE,
    property_id     UUID           NOT NULL REFERENCES properties(id) ON DELETE RESTRICT,
    guest_name      VARCHAR(160)   NOT NULL,
    guest_phone     VARCHAR(48)    NOT NULL,
    check_in        DATE           NOT NULL,
    check_out       DATE           NOT NULL,
    nights          INTEGER        NOT NULL CHECK (nights > 0),
    total_usd       NUMERIC(12, 2) NOT NULL CHECK (total_usd >= 0),
    status          VARCHAR(32)    NOT NULL DEFAULT 'PENDING',
    previous_status VARCHAR(32),
    notes           TEXT,
    created_by      UUID           REFERENCES users(id) ON DELETE SET NULL,
    created_at      TIMESTAMPTZ    NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ    NOT NULL DEFAULT NOW(),
    CONSTRAINT chk_bookings_dates CHECK (check_out > check_in),
    CONSTRAINT chk_bookings_status CHECK (status IN ('PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED')),
    CONSTRAINT no_overlapping_active_bookings
        EXCLUDE USING gist (
            property_id WITH =,
            daterange(check_in, check_out, '[)') WITH &&
        )
        WHERE (status IN ('CONFIRMED', 'PENDING'))
);

CREATE INDEX idx_bookings_property_dates ON bookings(property_id, check_in, check_out);
CREATE INDEX idx_bookings_status ON bookings(status);
CREATE INDEX idx_bookings_check_in ON bookings(check_in DESC);

CREATE TABLE exchange_rates (
    code        VARCHAR(8)     PRIMARY KEY,
    name_ar     VARCHAR(80)    NOT NULL,
    name_fr     VARCHAR(80)    NOT NULL,
    symbol_ar   VARCHAR(16)    NOT NULL,
    symbol_fr   VARCHAR(16)    NOT NULL,
    rate_to_usd NUMERIC(12, 4) NOT NULL CHECK (rate_to_usd > 0),
    is_prefix   BOOLEAN        NOT NULL DEFAULT FALSE,
    updated_at  TIMESTAMPTZ    NOT NULL DEFAULT NOW()
);

CREATE TABLE audit_logs (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    actor_id    UUID         REFERENCES users(id) ON DELETE SET NULL,
    actor_email VARCHAR(180) NOT NULL,
    action      VARCHAR(64)  NOT NULL,
    entity_type VARCHAR(64)  NOT NULL,
    entity_id   VARCHAR(64)  NOT NULL,
    payload     JSONB        NOT NULL DEFAULT '{}'::jsonb,
    created_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at DESC);
CREATE INDEX idx_audit_logs_entity ON audit_logs(entity_type, entity_id);
