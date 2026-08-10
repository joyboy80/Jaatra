# Jaatra Frontend

**Your Journey, Smarter.**

Jaatra is a responsive university transportation platform for passengers, drivers, and transport authorities. This frontend currently uses mock services and browser storage, while keeping service boundaries ready for future backend, GPS, WebSocket, QR scanner, and AI integrations.

## Technology

- React 18
- JavaScript and JSX
- React Router
- Tailwind CSS
- Lucide React icons
- Vite

## Run Locally

```bash
npm install
npm run dev
```

Open the URL printed by Vite, normally `http://localhost:5173`.

Create a production build with:

```bash
npm run build
```

## Mock Login

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

Replace the mock implementations with API clients while preserving their exported interfaces to minimize UI changes.

## Browser Storage

The mock application persists authentication, reservations, tickets, notifications, admin changes, AI conversations, and theme preferences in browser `localStorage`. Clear site storage to reset all mock state.

## Responsive Support

The interface is mobile-first and designed for widths from 320px through large desktop displays. Desktop layouts use a sidebar and top navigation; mobile layouts use a slide-out navigation drawer and touch-friendly controls.

## Important

This is currently a frontend demonstration. Mock authentication and generated QR identifiers are not suitable for production security. A production deployment must validate authentication, authorization, reservations, tickets, QR scans, and operational updates on a trusted backend.
