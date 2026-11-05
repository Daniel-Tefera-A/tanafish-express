# TanaFish Express

Lake Tana fish ordering and distribution for Bahir Dar. Next.js 14 (App Router), Tailwind, Lucide, NextAuth (Google), Supabase (PostgreSQL), mock Telebirr / CBE Birr / Chapa payments, English + Amharic.

## Run it

```bash
npm install
cp .env.example .env.local     # add GOOGLE_CLIENT_ID/SECRET + NEXTAUTH_SECRET
npm run dev
```

The demo works without Supabase: orders, cart and profile live in `localStorage`, and a `BroadcastChannel` links tabs in real time.
Open `/marketplace` in one tab and `/hotel` + `/driver` in others to watch an order travel end to end.

To use the database, run `supabase/schema.sql` in the Supabase SQL editor and fill the Supabase env vars.

## Structure

```
supabase/schema.sql              tables, enums, indexes, realtime, RLS sketch, seed data
src/lib/i18n.tsx                 EN/AM dictionary + provider + toggle state
src/lib/data.ts                  fish, hotels, dish styles, kebeles, fees
src/lib/store.tsx                orders / cart / profile (localStorage) — swap for Supabase queries
src/lib/realtime.ts              BroadcastChannel bus + Web Audio bell — swap for Supabase Realtime
src/lib/auth.ts                  NextAuth Google provider, role claim in session
src/components/                  ui primitives, nav, order tracker, location picker
src/app/page.tsx                 landing + Google sign-in, redirects first-timers to onboarding
src/app/onboarding               role selection (Individual / Hotel / Driver) with role-specific forms
src/app/marketplace              Raw & Fresh Catch tab + Cooked Dishes tab (hotel, dish style, rating, prep time)
src/app/checkout                 address, map pin, Telebirr / CBE Birr / Chapa, pay upfront
src/app/orders/[id]              tracker: Placed → Kitchen Preparing → Driver En Route → Delivered, delivery OTP
src/app/hotel                    KDS with sound + visual alert, menu toggles + prep fees, B2B bulk order
src/app/driver                   job feed, QR/OTP pickup token, OTP-verified delivery and payout
src/app/api/payments             mock gateway (live-integration notes inline)
src/app/api/onboarding           persists users / hotels / drivers when Supabase is configured
```

## Order lifecycle

`PENDING_PAYMENT → PAID → PREPARING → READY_FOR_PICKUP → IN_TRANSIT → DELIVERED`

- RAW and BULK_B2B orders skip the kitchen: after payment they appear in the driver feed for pickup at the Fishermen Hub.
- COOKED orders ring the hotel KDS on payment; the driver sees them only once the kitchen marks them ready.
- Delivery needs the 4-digit OTP shown on the customer's order page; entering it releases the driver payout.

## Before production

- Replace `localStorage` store with Supabase queries and the Realtime channel (snippet in `realtime.ts`).
- Wire real payment providers behind `/api/payments` and confirm via webhooks, not the client.
- Tighten the RLS policies, move driver ID uploads to Supabase Storage, and add admin verification of hotel TIN and driver ID.
- Add a SUPPLIER (Fishermen Hub) portal; the schema and roles already include it.
