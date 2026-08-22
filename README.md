# SAFAR

**Your Journey, Smarter.**

SAFAR is a responsive CUET transportation platform for passengers, drivers, and transport authorities. It combines a React/Vite frontend with an Express/Supabase backend for authentication, fleet operations, reservations, tickets (with digital download & sharing), tracking, notifications, Driver workflows, AI predictive insights, and administration.

The backend is required. The frontend has no demo mode or local operational data.

## Technology

- React 18, React Router, Tailwind CSS, and Vite
- Node.js 20 and Express 5
- Supabase Auth and PostgreSQL
- Nodemailer SMTP delivery

## Run Locally

Configure the backend using [`backend/.env.example`](backend/.env.example), apply the migrations described in [`backend/README.md`](backend/README.md), and then run:

```bash
cd backend
npm install
npm run dev
```

In another terminal:

```bash
cd Frontend
npm install
npm run dev
```

`VITE_API_URL` defaults to `/api`. Vite proxies that path to the local backend so HttpOnly cookies remain same-origin.

## Documentation

- [`Frontend/README.md`](Frontend/README.md) — frontend setup, roles, routes, storage, and integration boundaries
- [`backend/README.md`](backend/README.md) — API, Supabase migrations, SMTP, security, and Admin bootstrap

## Security

The backend owns passwords, sessions, authorization, identity roles, reservations, tickets, QR verification, and operational mutations. Never expose Supabase secret keys, SMTP passwords, OTP secrets, or tokens through `VITE_*` variables.
