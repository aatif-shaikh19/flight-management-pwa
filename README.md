# SkyBook — Flight Management PWA

> A full-stack flight booking web application built with Next.js 16, Supabase, and Zustand.

## Live Demo

[Production URL](https://flight-management-pwa-virid.vercel.app/)

## Tech Stack

- **Frontend**: Next.js 16 (App Router), TypeScript, Tailwind CSS v4
- **Backend**: Supabase (PostgreSQL, Auth, Realtime, RPC)
- **State**: Zustand with persist middleware
- **Validation**: Zod
- **Deployment**: Vercel

## Features

- Flight search across 4 Indian city routes
- Visual seat map with live availability (Supabase Realtime)
- Full booking flow with instant PNR generation
- My Bookings: reschedule and cancel with atomic DB operations
- 2-hour cancellation rule enforced at DB level (trigger)
- Race-condition-safe seat reservation via PostgreSQL RPC with `FOR UPDATE` lock
- No PII (passport numbers) stored in localStorage

## Local Setup

### Prerequisites

- Node.js 18+
- pnpm (`npm install -g pnpm`)
- Supabase account
- Supabase CLI (`pnpm add -g supabase`)

### Steps

1. Clone the repository

```bash
git clone https://github.com/aatif-shaikh19/flight-management-pwa.git
cd flight-management-pwa
```

2. Install dependencies

```bash
pnpm install
```

3. Set up environment variables

```bash
cp .env.example .env.local
# Fill in your Supabase credentials in .env.local
```

4. Link to your Supabase project

```bash
pnpm supabase login
pnpm supabase link --project-ref owqheovcsupgculqikwx
```

5. Run migrations

```bash
pnpm supabase db push
```

6. Run seed data

```bash
pnpm supabase db execute --file supabase/seed.sql
```

7. Generate TypeScript types

```bash
pnpm supabase gen types typescript --project-id YOUR_PROJECT_REF > src/types/supabase.ts
```

8. Start the dev server

```bash
pnpm dev
```

## Test Account

- **Email**: test@flightapp.com
- **Password**: Test@1234

## Environment Variables

| Variable                       | Description                              |
| ------------------------------ | ---------------------------------------- |
| `NEXT_PUBLIC_SUPABASE_URL`     | Supabase project URL                     |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY`| Supabase anon/public key                 |
| `SUPABASE_SERVICE_ROLE_KEY`    | Supabase service role key (server only)  |
| `SUPABASE_JWT_SECRET`          | Supabase JWT secret                      |

## Zustand Store Architecture

### useFlightStore

Manages the entire booking flow state.

| Field                        | Type               | Persisted | Notes                                     |
| ---------------------------- | ------------------ | --------- | ----------------------------------------- |
| `searchQuery`                | `SearchQuery \| null` | ✅        | Fills form on back navigation             |
| `bookingStep`                | `BookingStep`      | ✅        | Resumes flow after tab close              |
| `passengerForm.fullName`     | `string`           | ✅        | Safe to persist                           |
| `passengerForm.nationality`  | `string`           | ✅        | Safe to persist                           |
| `passengerForm.dob`          | `string`           | ✅        | Safe to persist                           |
| `passengerForm.passportNo`   | N/A                | ❌        | **Never in store — component state only** |
| `selectedFlight`             | `Flight \| null`   | ❌        | Re-fetched on navigation                  |
| `selectedSeat`               | `Seat \| null`     | ❌        | Re-selected if tab closed                 |

### useUserStore

Manages auth session.

| Field                  | Persisted | Notes                                |
| ---------------------- | --------- | ------------------------------------ |
| `session.access_token` | ✅        | Token only — not full session object |
| `user`                 | ❌        | Fetched fresh on mount               |

Both stores reset completely on logout.

## Database Schema

```
flights      → root entity (routes, pricing, schedule)
seats        → seat map per flight (availability tracked here)
bookings     → user + flight + seat + PNR
passengers   → traveller details (passport stored server-side only)
reschedules  → audit log of all booking changes
```

RLS enabled on all tables. Users can only access their own bookings, passengers, and reschedules.

## Key Technical Decisions

**Seat reservation via RPC with FOR UPDATE lock**
Prevents double-booking under concurrent requests. Two users clicking the same seat simultaneously — only one succeeds, the other gets a clear error.

**2-hour cancellation rule at DB level**
Enforced by a PostgreSQL trigger on the bookings table. Cannot be bypassed by application code.

**Passport numbers never in localStorage**
Collected in component `useState`, passed directly to Server Action, stored only in the DB. `partialize` in Zustand explicitly excludes it.

**Server Components for data fetching**
All Supabase queries on listing pages run server-side. No keys exposed to the browser beyond the anon key.

## Trade-offs & What I'd Do Differently

- **Single passenger per booking**: With more time, I'd support multi-passenger bookings with one seat per person, useful for families.
- **Static routes**: The 4 routes are hardcoded in seed data. A real system would have dynamic route management.
- **No email notifications**: PNR is shown on screen only. Production would send a booking confirmation email.
- **Reschedule atomicity**: The reschedule flow uses two separate DB calls instead of a single RPC. With more time, I'd wrap it in a `reschedule_booking` RPC for true atomicity.
- **Payment**: Prices are shown but no real payment gateway. Integration with Razorpay would be the next step.
