# ETST-MR

Full-stack Next.js app using Prisma ORM with PostgreSQL on Supabase.

## Run locally

```bash
npm install
cp .env.example .env   # fill in the database password and dashboard credentials
npx prisma migrate deploy
npm run dev
```

`DATABASE_URL` is the transaction pooler (port 6543) used at runtime; `DIRECT_URL` is the session pooler (port 5432) used by Prisma migrations. URL-encode special characters in the password and never expose these with a `NEXT_PUBLIC_` prefix.

## Areas

The app has two separate areas that share one calendar component.

- **Client** (`/`, no sign-in): view the lab calendar and book a slot. Only approved bookings are shown, without contact details. A booking always **starts at the moment it is submitted** (the server sets the start time) and the visitor only picks a duration, so past bookings are impossible. Overlaps in the same room are rejected inside a PostgreSQL transaction.
- **Dashboard** (`/dashboard`, sign-in required): overview, calendar (approved and pending, click an event for details), approvals (with rejection reasons), and finance (add/edit/delete, month/type filters, CSV export).

Set `ADMIN_USERNAME`, `ADMIN_PASSWORD` and `ADMIN_SESSION_SECRET` as environment variables (never commit them). Signing in sets an HttpOnly cookie valid for 8 hours; failed sign-ins are rate-limited (5 per 15 minutes). Dashboard pages check the session on the server (`requireAdminPage`) and every `/api/dashboard/*` route re-checks the cookie (`assertAdmin`).

Text input (titles, names, rooms, descriptions) can be written in any language, including Vietnamese.

## Layout

- `app/(client)` and `components/client` — client area
- `app/dashboard`, `app/api/dashboard` and `components/dashboard` — dashboard area
- `components/calendar` — week calendar used by both; `components/ui` — modal and toast
- `lib/` — validation (zod), queries, serializers and API helpers

After pulling updates run `npx prisma migrate deploy` (latest migration: `20261101000000_english_values`, which converts stored activity types and transaction kinds to English).

## Deploy on Vercel

Import the repo and set `DATABASE_URL`, `DIRECT_URL`, `ADMIN_USERNAME`, `ADMIN_PASSWORD` and `ADMIN_SESSION_SECRET` for the Production and Preview environments. If the app cannot load data after deploying, open `/api/health` on that deployment: `databaseUrlPresent` and `directUrlPresent` must be `true` (the endpoint never returns secret values). Redeploy after changing variables.
