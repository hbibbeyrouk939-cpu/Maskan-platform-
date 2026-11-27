# Maskan REST API v1 Reference

Base URL: `/api/v1`  
Headers:
- `Authorization: Bearer <accessToken>` (required for protected endpoints)
- `Accept-Language: ar` or `fr` (localizes RFC 7807 `ProblemDetail` and OTP messages)

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/auth/otp/request` | Send a 6-digit OTP via `SMS` (country E.164 phone) or `EMAIL` |
| `POST` | `/auth/register` | Create a new user account after verifying the 6-digit OTP |
| `POST` | `/auth/login` | Authenticate with email and password |
| `POST` | `/auth/login/otp` | Passwordless login using a 6-digit SMS or Email OTP |
| `POST` | `/auth/refresh` | Rotate Refresh token and obtain new Access token |
| `GET` | `/me` | Retrieve authenticated user profile and preferences |
| `PATCH` | `/me/preferences` | Persist `preferredLang`, `preferredTheme`, `preferredCurrency` |
| `GET` | `/properties` | List all active residential properties (bilingual AR/FR) |
| `POST` | `/properties` | Create a new residential property |
| `PUT` | `/properties/{id}` | Update an existing property |
| `DELETE` | `/properties/{id}` | Soft-delete a property |
| `GET` | `/bookings` | List bookings (optional `?status=PENDING|CONFIRMED|COMPLETED|CANCELLED`) |
| `POST` | `/bookings` | Create booking (server-side total calculation + DB overlap guard) |
| `PATCH` | `/bookings/{id}/status` | Approve/reject/complete booking and store `previousStatus` |
| `POST` | `/bookings/{id}/undo` | Restore the booking's `previousStatus` |
| `GET` | `/analytics/summary` | Retrieve KPIs, 6-month revenue series, and per-property breakdown |
| `GET` | `/exchange-rates` | Public list of supported currencies (`USD`, `EUR`, `MRU`) |
