# SAFAR Frontend

**Your Journey, Smarter.**

SAFAR is a backend-required React portal for university passengers, drivers, and transport administrators. Authentication and operational data always come from the SAFAR Express/Supabase backend. The frontend contains no demo mode, mock users, seeded transport records, simulated operations, or browser-persisted application data.

## Technology

- React 18 and React Router 6
- JavaScript and JSX
- Tailwind CSS 3
- Lucide React icons
- Vite 6

Node.js 20 or newer is recommended.

## Required Backend

Configure and start the backend before the frontend. Follow [`../backend/README.md`](../backend/README.md) to apply the Supabase migrations and configure authentication, SMTP, OTP delivery, and the Transport Admin account.

```bash
cd ../backend
npm install
npm run dev
```

The local backend listens on `http://127.0.0.1:5000` by default.

## Frontend Setup

```bash
cd Frontend
npm install
copy .env.example .env
npm run dev
```

Open the URL printed by Vite, normally <http://localhost:5173>.

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the development server |
| `npm run build` | Create the production bundle in `dist/` |
| `npm run preview` | Preview the production bundle |

## API Configuration

`VITE_API_URL` is optional and defaults to `/api`:

```env
VITE_API_URL=/api
```

During local development, Vite proxies `/api` to `http://127.0.0.1:5000`. The same-origin path allows the browser to send secure backend-issued HttpOnly cookies. Set an explicit URL only when the deployment architecture requires it.

Never put Supabase secret keys, SMTP credentials, OTP secrets, access tokens, or other server secrets in a `VITE_*` variable. Vite exposes those values to the browser bundle.

To enable the live Google Map, create a Google Maps browser key, enable **Maps JavaScript API**, restrict the key to the frontend's HTTP referrers (for example `http://localhost:5173/*` and the production domain), and set `VITE_GOOGLE_MAPS_API_KEY` in `Frontend/.env`. Do not use a server key in the frontend.

## Authentication

The frontend supports:

- Registration for Student, Teacher, Staff, and Driver accounts
- Email OTP delivery, resend, and verification
- Login and logout
- Session restoration exclusively through `GET /api/auth/me`
- Password recovery and reset
- Safe profile updates
- Verified, active Drivers can access their portal immediately after OTP verification

Supabase passwords and sessions are owned by the backend. Access and refresh tokens are not stored in frontend JavaScript, `localStorage`, or `sessionStorage`. The backend uses HttpOnly, `SameSite=Lax` cookies.

`ProtectedRoute` blocks unauthenticated navigation and `RoleBasedRoute` separates Student, Teacher, Staff, Driver, and Transport Admin portals. Backend authorization remains the security boundary.

## Portals

### Student, Teacher, and Staff

- Role-filtered buses and routes
- Trip and seat selection
- Reservations and cancellation
- Tickets (including digital download and share links)
- Backend-reported tracking positions rendered with Google Maps when configured
- Notifications, profile, and settings (including push/email preferences and password updates)

Portal roots are `/student`, `/teacher`, and `/staff`.

### Driver

- Assigned trips and passenger manifests
- Backend ticket verification and boarding
- Trip status changes
- Browser geolocation publishing to the backend
- Condition, delay, and emergency reports

The Driver portal begins at `/driver/dashboard`.

### Transport Admin

- Bus, route, and schedule management
- Reservation and user monitoring
- Driver assignment and status management
- Maintenance records and operational alerts
- Fleet tracking and backend analytics
- AI-driven smart transportation insights, predictions, and allocation recommendations

The Transport Admin portal begins at `/admin/dashboard`.

## Backend API Groups

| API group | Responsibility |
| --- | --- |
| `/api/auth` | Registration, OTP, login, cookies, recovery, and profiles |
| `/api/transport` | Buses, routes, trips, reservations, tickets, tracking, and notifications |
| `/api/driver/transport` | Driver trips, manifests, status, location, ticket verification, and reports |
| `/api/admin/transport` | Fleet CRUD, users, drivers, maintenance, alerts, overview, and analytics |

API failures are surfaced to the interface. Services do not substitute mock data or report local success.

## Unavailable Features

The current backend does not expose endpoints for:

- SAFAR AI chat
- A WebSocket server
- QR image generation or camera decoding

The corresponding useful pages remain visible but show **Feature currently unavailable**. Tracking and notifications use backend polling; they do not simulate updates.

## Project Structure

```text
src/
  components/       Shared UI grouped by domain
  context/          Authentication and theme providers
  hooks/            Backend tracking hook
  layouts/          Dashboard shell
  pages/            Auth, passenger, Driver, Admin, and shared pages
  routes/           Authentication and role route guards
  services/         Backend-only API adapters
  utils/            Roles, navigation, validation, dates, and seat layout
  App.jsx            Route map
  main.jsx           Application entry point
```

## Browser Storage

The only application storage intentionally preserved is:

- `safar.theme` â€” Light, Dark, or System theme preference

At startup, a narrowly scoped cleanup removes known legacy SAFAR demo keys for authentication, reservations, tickets, notifications, Driver operations, Admin records, and AI conversations. It never calls `storage.clear()` and does not remove theme preferences or unrelated site data.

## Production Deployment

1. Run `npm run build`.
2. Deploy the configured backend and apply all Supabase migrations.
3. Prefer serving the frontend and `/api` under the same site.
4. Configure the backend's exact production `CLIENT_ORIGINS`.
5. Use HTTPS.
6. Configure the host to serve `index.html` for client-side routes.
7. Smoke-test every role against real backend accounts and records.

## Verification

```bash
npm run build
```

Verify registration, OTP, authentication, session restoration, role redirects, empty/error states, reservation concurrency, cancellation, ticket verification, Driver reports, Admin mutations, tracking, notifications, responsive navigation, and theme persistence.
