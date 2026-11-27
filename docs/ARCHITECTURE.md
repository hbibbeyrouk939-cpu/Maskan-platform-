# Maskan Platform — System Architecture

## 1. Repository Structure
```text
maskan-platform/
├── backend/                  # Spring Boot 3.4 (Java 21) + Flyway + PostgreSQL 16
│   ├── src/main/java/com/maskan/platform/
│   │   ├── config/           # SecurityConfig, OpenApiConfig, LocaleConfig
│   │   ├── security/         # JwtService, JwtAuthenticationFilter, UserPrincipal
│   │   ├── domain/           # JPA Entities & Enums
│   │   ├── repository/       # Spring Data JPA Repositories
│   │   ├── dto/              # Java 21 Records with Jakarta Validation
│   │   ├── exception/        # Localized RFC 7807 GlobalExceptionHandler
│   │   ├── service/          # Transactional Business Logic & AuditService
│   │   └── controller/       # REST API v1 Controllers
│   └── src/main/resources/
│       ├── db/migration/     # V1__init_schema.sql, V2__seed_data.sql
│       └── i18n/             # messages_ar.properties, messages_fr.properties
├── frontend/                 # Vite + React 19 + TypeScript + Tailwind CSS
│   ├── public/assets/        # Optimized WebP property images
│   └── src/
│       ├── styles/           # OKLCH tokens + 100% Logical CSS
│       ├── i18n/             # ar.json & fr.json
│       ├── services/         # apiClient.ts (JWT refresh + Accept-Language)
│       ├── hooks/            # GSAP + ScrollTrigger + Lenis single motion engine
│       └── features/         # overview, properties, bookings, calendar, financials
├── docker/                   # Multi-stage Dockerfiles + Nginx reverse proxy
├── .github/workflows/ci.yml  # Automated CI pipeline
└── docker-compose.yml
```

## 2. Concurrency & Double-Booking Prevention
Application-level overlap checks alone are vulnerable to race conditions under concurrent requests. Maskan enforces booking exclusivity directly inside PostgreSQL 16 using `btree_gist`:
```sql
CONSTRAINT no_overlapping_active_bookings
    EXCLUDE USING gist (
        property_id WITH =,
        daterange(check_in, check_out, '[)') WITH &&
    )
    WHERE (status IN ('CONFIRMED', 'PENDING'))
```
Any concurrent conflict raises PostgreSQL SQLState `23P01`, which `GlobalExceptionHandler` translates into a localized HTTP `409 Conflict` RFC 7807 `ProblemDetail` response.
