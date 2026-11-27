# مَسْكَن | Maskan — Residential Hospitality & Booking Platform

منصة متكاملة لإدارة وحجز العقارات السكنية ثنائية اللغة (**العربية RTL ↔ الفرنسية LTR**)، مبنية بمعيار إنتاجي جاهز للنشر على GitHub عبر **React 19 + TypeScript + Vite + Tailwind CSS + GSAP/Lenis** في الواجهة الأمامية، و**Spring Boot 3 (Java 21) + PostgreSQL 16 + Flyway + JWT** في الخادم الخلفي.

---

## Architecture Highlights | أبرز المزايا المعمارية

- **True Bilingual RTL ↔ LTR (`ar` / `fr`)**: 100% CSS Logical Properties (`margin-inline`, `padding-inline`, `inset-inline`, `text-align: start/end`), fluid `clamp()` typography (`Readex Pro` + `IBM Plex Sans Arabic` / `Instrument Serif` + `Plus Jakarta Sans`), and locale-aware `Intl` formatting for `USD`, `EUR`, and `MRU`.
- **Zero Double-Booking Guarantee (PostgreSQL `btree_gist`)**: Enforced at the database engine level via `EXCLUDE USING gist (property_id WITH =, daterange(check_in, check_out, '[)') WITH &&) WHERE (status IN ('CONFIRMED', 'PENDING'))`.
- **Localized RFC 7807 `ProblemDetail` Errors**: Global Spring exception handler responds in Arabic or French based on `Accept-Language`.
- **Optimistic UI with Server-Backed Undo**: Instant approve/reject transitions with `/api/v1/bookings/{id}/undo` restoration.
- **Zero Base64 Bloat & Zero-Flash Theme Charts**: External WebP property assets (`frontend/public/assets/*.webp`, 86% smaller than embedded JPEGs) and Chart.js 4 `chart.update('none')` on theme toggle.
- **Mobile-First Re-Engineering**: Interactive booking cards (`md:hidden`), semantic calendar status dots, safe-area bottom navigation (`env(safe-area-inset-bottom)`), and `max-height: 90dvh` sheets.

---

## Quick Start (Docker Compose)

```bash
cp .env.example .env
docker compose up --build
```

- **Frontend**: `http://localhost:3000`
- **Backend API**: `http://localhost:8080/api/v1`
- **Swagger / OpenAPI UI**: `http://localhost:8080/swagger-ui.html`
- **Demo Accounts**: `admin@maskan.mr` / `concierge@maskan.mr` (Password: `Maskan2026!`)

---

## Local Development

### Backend (Java 21 + PostgreSQL 16)
```bash
cd backend
mvn spring-boot:run
```

### Frontend (Node 20+ / Vite)
```bash
cd frontend
npm install
npm run dev
```

See [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) and [`docs/API.md`](docs/API.md) for detailed system design and endpoint contracts.
