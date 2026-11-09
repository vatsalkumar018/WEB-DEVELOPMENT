# Canteen Management System ("Token & Bite")
## Production Supabase & PostgreSQL Architecture Documentation

This document describes the complete backend architecture, database schema, Row-Level Security (RLS) policies, atomic token generation engine, and Supabase integration for the college campus **Canteen Management System**.

---

## 1. Architecture Overview

The system strictly follows the modern, secure Supabase architecture:
- **No intermediary Express/Node server** is required.
- All critical business rules (token uniqueness, atomic wallet deduction, serving-time restrictions, order state transitions, and audit trails) are **strictly enforced in PostgreSQL** using stored procedures, foreign key constraints, and triggers.
- The React + TypeScript frontend connects to Supabase via `@supabase/supabase-js`, leveraging Supabase Auth, PostgreSQL Row Level Security (RLS), Supabase Realtime, and Supabase Storage.

```
┌────────────────────────────────────────────────────────────────────────┐
│                   React 19 + TypeScript Frontend                       │
│  (Student App / Staff Operations / Kitchen Display / Admin Dashboard)  │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
                                    │ HTTPS (PostgREST + RPC + Auth + Storage)
                                    │ WSS (Supabase Realtime WebSockets)
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                          Supabase Platform                             │
├────────────────────────────────────────────────────────────────────────┤
│ • Supabase Auth: JWT Authentication & User Metadata                    │
│ • Row Level Security: Strict table isolation based on auth.uid() & role│
│ • Realtime Publications: orders, tokens, notifications, settings      │
│ • Supabase Storage: 'menu-images' & 'profile-avatars' buckets          │
├────────────────────────────────────────────────────────────────────────┤
│                   PostgreSQL 15+ Core Engine                           │
│ ┌────────────────────────────────────────────────────────────────────┐ │
│ │ • Stored Procedures: create_order_atomic(), cancel_order_student() │ │
│ │ • State Machine Triggers: trg_enforce_order_state_machine()         │ │
│ │ • Concurrency-Safe Daily Counter: daily_token_counters (FOR UPDATE)│ │
│ │ • Immutable Order Item Snapshots: (historical price lock)          │ │
│ │ • Operational Views: v_kitchen_active_orders                       │ │
│ │ • Reporting Engine: get_admin_analytics()                          │ │
│ └────────────────────────────────────────────────────────────────────┘ │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Database Schema (Core Tables)

| Table Name | Primary Key | Description & Integrity Rules |
| :--- | :--- | :--- |
| `profiles` | `id` (UUID &rarr; `auth.users`) | Extended user profile: role (`STUDENT`, `STAFF`, `ADMIN`), student ID, campus wallet balance (`CHECK >= 0`), contact details. |
| `menu_categories`| `id` (UUID) | Food categories (`meals`, `beverages`, `snacks`, `desserts`), display order, active flag. |
| `menu_items` | `id` (UUID) | Menu catalog with `price`, `ingredients` (array), `available`, `serving_start`, and `serving_end`. Serving hours enforced by `chk_serving_hours`. |
| `operating_hours`| `id` (UUID) | Day-of-week meal windows (`BREAKFAST`, `LUNCH`, `SNACKS`, `DINNER`). Unique per `(day_of_week, service_type)`. |
| `canteen_settings`| `id` (INT = 1) | Singleton configuration row for live canteen operations: `is_open`, `rush_mode`, `rush_pause_orders`, `average_wait_minutes`, active announcements. |
| `daily_token_counters`| `(service_date, prefix)` | Atomic counter row locked during checkout to guarantee sequential, non-colliding token numbers per service day (`A-001`, `A-002`, ...). |
| `tokens` | `id` (UUID) | Issued service tokens. Unique constraint: `UNIQUE (service_date, token_number)`. |
| `orders` | `id` (UUID) | Core order ledger: `user_id`, `token_id`, `status` (`PLACED`, `PREPARING`, `READY`, `COLLECTED`, `CANCELLED`), financial sums, payment status, dining type, counter assignments. |
| `order_items` | `id` (UUID) | **Immutable order snapshot**. Freezes `item_name`, `item_description`, `unit_price`, and `subtotal` at time of purchase so historical receipts never change. |
| `order_status_history`| `id` (UUID) | Immutable audit trail recorded on every status transition with `old_status`, `new_status`, timestamp, and actor ID. |
| `inventory` | `id` (UUID) | Raw ingredients stock. `status` (`HEALTHY`, `LOW`, `OUT_OF_STOCK`) is a PostgreSQL generated column based on `quantity` vs `minimum_quantity`. |
| `inventory_transactions`| `id` (UUID) | Stock movement audit trail (`PURCHASE_RESTOCK`, `ORDER_CONSUMPTION`, `WASTAGE`, `CORRECTION`). |
| `notifications` | `id` (UUID) | Targeted student alerts and campus announcements (`ORDER_READY`, `ORDER_UPDATE`, `CANTEEN_ANNOUNCEMENT`). |
| `feedback` | `id` (UUID) | Post-meal satisfaction ratings (1–5) and category scores. Unique per order (`UNIQUE (order_id)`). |

---

## 3. Server-Side Token Generation & Concurrency Safety

### The Problem
During peak canteen rushes (e.g. 1:00 PM lunch break), dozens of students may click "Place Order" within the exact same millisecond. Frontend random token generators or non-atomic auto-increments cause duplicate tokens, race conditions, and kitchen confusion.

### The Solution: Row-Level Locking in `create_order_atomic()`
1. PostgreSQL maintains a dedicated counter table:
   ```sql
   CREATE TABLE public.daily_token_counters (
     service_date DATE NOT NULL,
     prefix VARCHAR(2) NOT NULL DEFAULT 'A',
     last_number INTEGER NOT NULL DEFAULT 0,
     PRIMARY KEY (service_date, prefix)
   );
   ```
2. When `create_order_atomic()` executes, it acquires an exclusive pessimistic lock on today's counter row using `SELECT ... FOR UPDATE`:
   ```sql
   INSERT INTO public.daily_token_counters (service_date, prefix, last_number)
   VALUES (CURRENT_DATE, 'A', 0)
   ON CONFLICT (service_date, prefix) DO NOTHING;

   SELECT last_number + 1 INTO v_next_token_seq
   FROM public.daily_token_counters
   WHERE service_date = CURRENT_DATE AND prefix = 'A'
   FOR UPDATE;

   UPDATE public.daily_token_counters
   SET last_number = v_next_token_seq
   WHERE service_date = CURRENT_DATE AND prefix = 'A';

   v_token_number := format('A-%s', lpad(v_next_token_seq::text, 3, '0'));
   ```
3. Even if 100 students checkout simultaneously, PostgreSQL serializes the lock in microseconds. Each transaction receives a strictly ascending, unique token (`A-001`, `A-002`, `A-003`).
4. In addition, the `tokens` table enforces a hard constraint:
   ```sql
   CONSTRAINT uq_daily_token UNIQUE (service_date, token_number)
   ```
   ensuring database-level impossibility of duplicate tokens.

---

## 4. Order State Machine & Integrity Rules

All order status updates pass through the database trigger `trg_enforce_order_state_machine`:

```
          ┌────────────┐
          │   PLACED   ├────────────────┐
          └─────┬──────┘                │
                │                       │ Student or Staff Cancel
                │ Kitchen Starts        ▼
                ▼                ┌─────────────┐
          ┌────────────┐         │  CANCELLED  │ (Terminal)
          │ PREPARING  │         └─────────────┘
          └─────┬──────┘
                │ Kitchen Completes
                ▼
          ┌────────────┐
          │   READY    │ ──> Triggers push notification to student
          └─────┬──────┘
                │ Counter Scan & Handover
                ▼
          ┌────────────┐
          │ COLLECTED  │ (Terminal)
          └────────────┘
```

### Business Rules Enforced by the Trigger:
1. **Valid Forward Transitions Only:**
   - `PLACED` &rarr; `PREPARING`
   - `PLACED` &rarr; `CANCELLED`
   - `PREPARING` &rarr; `READY`
   - `READY` &rarr; `COLLECTED`
2. **Terminal States:** Orders in `COLLECTED` or `CANCELLED` cannot be changed.
3. **Cancellation Rule:**
   - A student can **only** cancel an order while it is in the `PLACED` state.
   - Once preparation starts (`PREPARING`), cancellations are rejected with code `P0021`.
4. **Automatic Wallet Refund:**
   - If an order paid with `CAMPUS_PAY` is cancelled, the trigger automatically increments the student's `profiles.wallet_balance` by `orders.total`, sets `payment_status = 'REFUNDED'`, and dispatches a notification.
5. **Auditing:** Every transition is automatically written to `order_status_history`.

---

## 5. Row Level Security (RLS) Matrix

RLS is enabled on **100% of public tables**.

| Table | Anonymous (Public) | STUDENT | STAFF | ADMIN |
| :--- | :--- | :--- | :--- | :--- |
| `profiles` | None | Read/Update own profile | Read all profiles | Full CRUD |
| `menu_categories` | Read active | Read active | Read all | Full CRUD |
| `menu_items` | Read active | Read active | Read/Update availability | Full CRUD |
| `canteen_settings` | Read | Read | Read/Update operational mode | Full CRUD |
| `operating_hours` | Read active | Read active | Read all | Full CRUD |
| `orders` | None | Read/Cancel own orders | Read/Update status | Full CRUD |
| `order_items` | None | Read own order items | Read all | Full CRUD |
| `tokens` | Read active (for KDS) | Read own token | Read all | Full CRUD |
| `notifications` | Read broadcasts | Read/Dismiss own alerts | Read operational | Full CRUD |
| `feedback` | None | Create/Read own review | Read all reviews | Full CRUD |
| `inventory` | None | None | Read & log consumption | Full CRUD |

---

## 6. Realtime Channels

The database publication `supabase_realtime` broadcasts table events with `REPLICA IDENTITY FULL`:
- **Student App:** Subscribes to changes on `orders` (filtered by `user_id = eq.<auth.uid>`) and `notifications`.
- **Kitchen Display System (`/kitchen`):** Subscribes to `orders` and `tokens` to update the preparing and ready queues instantly.
- **Staff Counter Dashboard (`/staff`):** Subscribes to new orders and status updates.
- **Admin Dashboard (`/admin`):** Subscribes to `canteen_settings` and daily metrics.

---

## 7. Storage Buckets & Policies

Two pre-configured storage buckets:
1. `menu-images` (Public):
   - **SELECT:** Public read access for high-speed CDN delivery of dish images.
   - **INSERT/UPDATE/DELETE:** Restricted to users with role `STAFF` or `ADMIN`.
2. `profile-avatars` (Public):
   - **SELECT:** Public read access.
   - **INSERT/UPDATE/DELETE:** Restricted to the authenticated owner (`auth.uid()`).

---

## 8. Deployment Guide (1-Click Setup)

### Option A: Via Supabase Dashboard (Web SQL Editor)
1. Go to your [Supabase Project Dashboard](https://supabase.com/dashboard).
2. Open the **SQL Editor** in the left sidebar.
3. Open `supabase/schema.sql` from this codebase.
4. Copy and paste the entire content into the SQL Editor and click **Run**.
   - *This will execute all 7 migrations and seed data in under 5 seconds.*
5. Retrieve your project credentials from **Project Settings &rarr; API**:
   - `Project URL`
   - `anon public key`
6. Add them to your `.env` or `.env.local` file:
   ```env
   VITE_SUPABASE_URL=https://your-project-ref.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJhbGciOi...
   ```
7. Start or restart your Vite development server (`npm run dev`).

### Option B: Via Supabase CLI
```bash
# Login to Supabase CLI
npx supabase login

# Link your local project to your remote Supabase project
npx supabase link --project-ref your-project-ref

# Push migrations to the remote database
npx supabase db push

# Apply seed data
npx supabase db reset --linked # or execute supabase/seed.sql in SQL editor
```

---

## 9. Verification & Test Queries

Run these test queries in the Supabase SQL editor to verify database functionality:

### 1. Test Atomic Order Creation & Token Generation:
```sql
-- Simulate student checkout
SELECT public.create_order_atomic(
  p_items := jsonb_build_array(
    jsonb_build_object(
      'menu_item_id', 'm1000000-0000-0000-0000-000000000001'::uuid,
      'quantity', 1,
      'selected_addons', '[]'::jsonb
    ),
    jsonb_build_object(
      'menu_item_id', 'm1000000-0000-0000-0000-000000000006'::uuid,
      'quantity', 2,
      'selected_addons', '[]'::jsonb
    )
  ),
  p_dining_type := 'DINE_IN',
  p_payment_method := 'CAMPUS_PAY'
);
```

### 2. Verify Generated Token:
```sql
SELECT token_number, service_date, status, created_at 
FROM public.tokens 
ORDER BY created_at DESC 
LIMIT 5;
```

### 3. Verify KDS Active View:
```sql
SELECT * FROM public.v_kitchen_active_orders;
```

### 4. Verify Admin Analytics:
```sql
SELECT public.get_admin_analytics(CURRENT_DATE);
```

### 5. Verify State Machine Rejection (Should Fail):
```sql
-- Attempt invalid transition from PLACED directly to COLLECTED
UPDATE public.orders 
SET status = 'COLLECTED' 
WHERE status = 'PLACED';
-- Expected result: ERROR P0001: Invalid status transition
```
