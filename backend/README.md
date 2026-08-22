# SAFAR Backend

Express API for SAFAR authentication and shared transport operations. Supabase Auth owns passwords and sessions; Supabase PostgreSQL stores profiles, server-only OTP hashes, fleet data, reservations, tickets, tracking, notifications, and operational records.

## Setup

1. Install Node.js 20+ dependencies: `npm install`.
2. Copy `.env.example` to `.env` and enter the existing Supabase and SMTP credentials.
3. Run the SQL files in order in the existing Supabase project's SQL editor:
   - `supabase/migrations/001_profiles.sql` for a fresh database.
   - `supabase/migrations/002_complete_auth.sql` after the earlier SAFAR migration, or after `001` (it is safe to rerun the upgrade).
   - `supabase/migrations/003_transport.sql` for fleet, schedules, reservations, tickets, tracking, notifications, Driver operations, and maintenance data.
4. Apply `supabase/migrations/006_transport_schedule_schema.sql` for daily schedules and immediate Driver access, then start with `npm run dev`. The default API URL is `http://localhost:5000`.

Never expose `SUPABASE_SECRET_KEY`, `SMTP_PASSWORD`, or `OTP_HASH_SECRET` in a `VITE_*` variable or commit `.env`.

For local development, SMTP and `OTP_HASH_SECRET` may be omitted. OTPs are then printed to the backend terminal and the hashing secret is generated for that process. Production remains fail-closed and requires both SMTP credentials and a stable `OTP_HASH_SECRET`.

For Gmail delivery, enable 2-Step Verification on the sender account, create a Google App Password, and set `SMTP_HOST=smtp.gmail.com`, `SMTP_PORT=587`, `SMTP_SECURE=false`, `SMTP_USER`, `SMTP_PASSWORD`, and `SMTP_FROM` in `.env`. Use `npm run email:check` to verify the connection before requesting another OTP. The ordinary Gmail account password will not work.

Development CORS accepts frontend origins on `localhost`, loopback addresses, and private LAN addresses on any port. Production accepts only exact `CLIENT_ORIGINS` entries.

## Public authentication API

| Method | Endpoint | Purpose |
| --- | --- | --- |
| POST | `/api/auth/register` | Create a pending Student, Teacher, Staff, or Driver registration and email an OTP |
| POST | `/api/auth/send-otp` | Send another registration OTP, subject to limits |
| POST | `/api/auth/resend-otp` | Alias for `send-otp` |
| POST | `/api/auth/verify-otp` | Consume an OTP and verify the account |
| POST | `/api/auth/login` | Authenticate with Supabase Auth |
| POST | `/api/auth/refresh` | Exchange a refresh token |
| POST | `/api/auth/forgot-password` | Ask Supabase to send its secure recovery link |
| POST | `/api/auth/reset-password` | Set a new password using the recovery bearer token |

Student registration example:

```json
{
  "userType": "STUDENT",
  "fullName": "Mahbubur Rahman",
  "departmentCode": "04",
  "studentId": "094",
  "phone": "01712345678",
  "email": "u2204094@student.cuet.ac.bd",
  "password": "SecurePass1",
  "confirmPassword": "SecurePass1"
}
```

Student registrations require the structured `@student.cuet.ac.bd` address matching their department and three-digit student ID. Teacher, Staff, and Driver registrations accept any valid email provider and omit `studentId`. Public requests containing `ADMIN` or `TRANSPORT_ADMIN` are rejected. Department names are derived server-side from the submitted code.

OTP verification accepts `{ "email": "...", "otp": "123456" }`. OTPs expire after 10 minutes by default, are single-use, allow five attempts, enforce a 60-second resend cooldown, and allow five requests per rolling hour. Only salted HMAC hashes are stored.

Registration creates an unconfirmed Supabase Auth user before sending the custom OTP. This deliberately keeps the password inside Supabase Auth instead of storing it in a pending-registration table. Successful OTP verification confirms that Auth user and marks the profile verified.

## Protected API

Browser sessions use HttpOnly, `SameSite=Lax` access and refresh cookies. The API sets, rotates, and clears them on login, refresh, and logout. Bearer authorization remains accepted for password recovery and non-browser API clients.

| Method | Endpoint | Access |
| --- | --- | --- |
| POST | `/api/auth/logout` | Authenticated |
| GET | `/api/auth/me` | Authenticated |
| PUT | `/api/auth/profile` | Authenticated; name, phone, and profile image only |
| GET | `/api/profile` | Authenticated |
| PUT | `/api/profile` | Authenticated; same safe-field allowlist |
| GET | `/api/student/` | Student |
| GET | `/api/teacher/` | Teacher |
| GET | `/api/staff/` | Staff |
| GET | `/api/driver/` | Verified, active Driver |
| GET | `/api/admin/` | Transport Admin |
| GET | `/api/admin/drivers/pending` | Transport Admin |
| PUT | `/api/admin/drivers/:id/approve` | Transport Admin |
| PUT | `/api/admin/drivers/:id/reject` | Transport Admin |

Authentication middleware verifies the token through Supabase, loads the server-owned profile, and rejects unverified or inactive accounts. Verified, active Drivers can access their portal immediately after signing in; `approval_status` is retained only for compatibility. Role checks use `userType`; the legacy `role` response field exists only for compatibility and is never used for authorization.

## Transport API

Authenticated passenger endpoints under `/api/transport` provide role-filtered buses, routes, trips, tracking, reservations, tickets, notifications, and service status. Driver operations are under `/api/driver/transport`; Transport Admin CRUD, monitoring, and analytics are under `/api/admin/transport`.

Seat reservation, cancellation, and QR ticket use are PostgreSQL functions, keeping their reservation/ticket changes atomic. Transport tables deny direct `anon` and `authenticated` access; the authorized Express backend is the application data boundary.

## Transport Admin bootstrap

There is no public Transport Admin registration endpoint. Set the `BOOTSTRAP_ADMIN_*` values and run:

```bash
npm run admin:create
```

The script uses the server-side Supabase secret key, confirms the Auth user, and creates a `TRANSPORT_ADMIN` profile.

## Frontend integration

Set `VITE_API_URL=http://localhost:5000/api` in the React frontend. Fetch requests include credentials. Registration shows only Student, Teacher, Staff, and Driver; after OTP verification, users sign in and the browser restores the HttpOnly cookie session through `/api/auth/me`.

Backend authorization is the security boundary even when frontend protected routes are present.

## Verification

Run `npm test` and `npm run check`. Unit tests cover CUET identity rules, password policy, role middleware, OTP hashing, cookie security, and frontend transport serialization contracts.
