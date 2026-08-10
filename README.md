<<<<<<< HEAD
# Jaatra

**Your Journey, Smarter.**

Jaatra is a responsive CUET transportation platform for passengers, drivers, and transport authorities. It combines a React portal with an Express/Supabase backend for authentication and shared transport operations. The frontend can still run independently in demo mode.
=======
# Jaatra Frontend

**Your Journey, Smarter.**

Jaatra is a responsive university transportation platform for passengers, drivers, and transport authorities. This frontend currently uses mock services and browser storage, while keeping service boundaries ready for future backend, GPS, WebSocket, QR scanner, and AI integrations.
>>>>>>> 8f84bacd9b3d5ae2433637f4ef71ec2eac956543

## Technology

- React 18
- JavaScript and JSX
- React Router
- Tailwind CSS
- Lucide React icons
- Vite
<<<<<<< HEAD
- Node.js 20 and Express 5
- Supabase Auth and PostgreSQL
- Nodemailer SMTP delivery

## Run Locally

Frontend demo mode requires no backend:

```bash
cd Frontend
=======

## Run Locally

```bash
>>>>>>> 8f84bacd9b3d5ae2433637f4ef71ec2eac956543
npm install
npm run dev
```

Open the URL printed by Vite, normally `http://localhost:5173`.

Create a production build with:

```bash
npm run build
```

<<<<<<< HEAD
For real CUET authentication, configure both applications:

```bash
# backend/.env from backend/.env.example
cd backend
npm install
npm run dev

# Frontend/.env from Frontend/.env.example
cd Frontend
npm run dev
```

For local development, the frontend expects `VITE_API_URL=/api`; Vite proxies that same-origin path to `http://127.0.0.1:5000`. Follow [backend/README.md](backend/README.md) for Supabase migrations, SMTP configuration, and Transport Admin bootstrap.

## Authentication Modes

When `VITE_API_URL` is absent, Jaatra uses mock login and browser-backed demo transport data. When it is configured, Jaatra uses backend-owned roles, HttpOnly cookie sessions, CUET registration, email OTP verification, password recovery, and shared Supabase transport data.

### Mock Login
=======
## Mock Login
>>>>>>> 8f84bacd9b3d5ae2433637f4ef71ec2eac956543

Select the required role on the login page. Authentication accepts any non-empty email or university ID and any password containing at least six characters.

Default password:

```text
jaatra123
```

| Role | University ID | Email |
| --- | --- | --- |
| Student | `STU-2026-0142` | `mahbubur.rahman@university.edu` |
| Teacher | `FAC-2026-0031` | `nusrat.jahan@university.edu` |
| Staff | `STF-2026-0087` | `imran.chowdhury@university.edu` |
| Driver | `DRV-2026-0019` | `mizan.rahman@university.edu` |
| Transport Authority | `ADM-2026-0001` | `transport.authority@university.edu` |

## Portals

- Student: `/student/dashboard`
- Teacher: `/teacher/dashboard`
- Staff: `/staff/dashboard`
- Driver: `/driver/dashboard`
- Transport Authority: `/admin/dashboard`

Protected routes redirect unauthenticated users to `/login`. Role-based routes prevent users from opening another role's portal.

<<<<<<< HEAD
Public backend-authentication routes are `/register`, `/verify-otp`, `/forgot-password`, and `/reset-password`.

=======
>>>>>>> 8f84bacd9b3d5ae2433637f4ef71ec2eac956543
## Features

- Role-based authentication and navigation
- Role-specific bus access
- Bus search, filtering, details, and route exploration
- Time-based reservations and interactive seat selection
- Digital tickets with QR identifiers
- Reservation history and cancellation
- Driver trips, passenger list, mock QR verification, and boarding
- Driver condition, delay, emergency, and live-trip tools
- Admin fleet, bus, route, schedule, reservation, user, driver, and maintenance management
- Responsive analytics and AI demand insights
- Mock live tracking and real-time-style notifications
- Context-aware Jaatra AI chat
- Global Light, Dark, and System themes
- Role-specific visual accents

## Theme System

The centralized theme implementation is located in:

```text
src/context/ThemeContext.jsx
src/components/common/ThemeToggle.jsx
src/index.css
tailwind.config.js
```

Theme preference is stored in `localStorage` under `jaatra.theme`. Role accents are applied by the dashboard layout through a `data-role` attribute.

| Portal | Accent |
| --- | --- |
| Student | Violet |
| Teacher | Teal |
| Staff | Emerald |
| Driver | Amber |
| Transport Authority | Indigo |

## Project Structure

```text
src/
  assets/
  components/
    admin/
    ai/
    bus/
    common/
    driver/
    layout/
    reservation/
    ticket/
    tracking/
  context/
  data/
  hooks/
  layouts/
  pages/
    admin/
    auth/
    driver/
    shared/
    staff/
    student/
    teacher/
  routes/
  services/
  utils/
  App.jsx
  index.css
  main.jsx
```

## Service Architecture

Mock data access and integration boundaries live in `src/services/`:

- `authService.js`
- `busService.js`
- `routeService.js`
- `scheduleService.js`
- `reservationService.js`
- `ticketService.js`
- `trackingService.js`
- `websocketService.js`
- `notificationService.js`
- `driverService.js`
- `adminService.js`
- `aiService.js`
- `predictionService.js`
- `recommendationService.js`

<<<<<<< HEAD
Frontend services switch between local demo implementations and the Express API. Backend mode persists buses, routes, trips, schedules, reservations, tickets, tracking, notifications, Driver operations, maintenance, and admin data in Supabase while preserving the original UI service contracts.

## Browser Storage

In demo mode, transport data uses browser `localStorage`. In backend mode, transport records use Supabase and authentication tokens exist only in HttpOnly, SameSite cookies. Browser storage contains non-sensitive UI/session metadata, theme preference, and local AI conversation history.
=======
Replace the mock implementations with API clients while preserving their exported interfaces to minimize UI changes.

## Browser Storage

The mock application persists authentication, reservations, tickets, notifications, admin changes, AI conversations, and theme preferences in browser `localStorage`. Clear site storage to reset all mock state.
>>>>>>> 8f84bacd9b3d5ae2433637f4ef71ec2eac956543

## Responsive Support

The interface is mobile-first and designed for widths from 320px through large desktop displays. Desktop layouts use a sidebar and top navigation; mobile layouts use a slide-out navigation drawer and touch-friendly controls.

<<<<<<< HEAD
## Current Integration Boundary

The backend is the security boundary for identity, roles, profiles, Driver approval, reservations, tickets, QR scans, fleet management, notifications, and operational updates. GPS positions and AI responses remain simulated inputs, although their shared operational context is read from the backend. Production should deploy the frontend and API on the same site so the HttpOnly `SameSite=Lax` session cookies work reliably.
=======
## Important

This is currently a frontend demonstration. Mock authentication and generated QR identifiers are not suitable for production security. A production deployment must validate authentication, authorization, reservations, tickets, QR scans, and operational updates on a trusted backend.
>>>>>>> 8f84bacd9b3d5ae2433637f4ef71ec2eac956543
