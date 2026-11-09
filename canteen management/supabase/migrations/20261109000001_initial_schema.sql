-- ============================================================================
-- CANTEEN MANAGEMENT SYSTEM - POSTGRESQL RELATIONAL SCHEMA
-- Migration: 20261109000001_initial_schema.sql
-- ============================================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ----------------------------------------------------------------------------
-- 1. ENUMS & DOMAINS
-- ----------------------------------------------------------------------------
DO $$ BEGIN
  CREATE TYPE public.app_role AS ENUM ('STUDENT', 'STAFF', 'ADMIN');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE public.order_status AS ENUM (
    'PLACED',
    'PREPARING',
    'READY',
    'COLLECTED',
    'CANCELLED'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE public.payment_method_type AS ENUM (
    'CAMPUS_PAY',
    'UPI',
    'CASH_AT_COUNTER'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE public.dining_type_enum AS ENUM (
    'DINE_IN',
    'TAKEAWAY'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE public.inventory_status AS ENUM (
    'HEALTHY',
    'LOW',
    'OUT_OF_STOCK'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE public.feedback_category AS ENUM (
    'FOOD_QUALITY',
    'WAITING_TIME',
    'STAFF_BEHAVIOUR',
    'CLEANLINESS',
    'OVERALL'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE public.notification_type AS ENUM (
    'ORDER_READY',
    'ORDER_UPDATE',
    'CANTEEN_ANNOUNCEMENT',
    'ITEM_UNAVAILABLE',
    'SERVICE_UPDATE'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- ----------------------------------------------------------------------------
-- 2. USER PROFILES (Linked to auth.users)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  student_id TEXT,
  email TEXT NOT NULL,
  phone TEXT,
  role public.app_role NOT NULL DEFAULT 'STUDENT',
  wallet_balance NUMERIC(10, 2) NOT NULL DEFAULT 150.00 CHECK (wallet_balance >= 0),
  avatar_url TEXT,
  campus_block TEXT DEFAULT 'Campus Block 4',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Helper function to fetch role without recursive RLS issues
CREATE OR REPLACE FUNCTION public.get_user_role(p_user_id UUID)
RETURNS public.app_role
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT role FROM public.profiles WHERE id = p_user_id;
$$;

-- Trigger to sync user creation from auth.users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (
    id,
    name,
    student_id,
    email,
    phone,
    role,
    wallet_balance,
    avatar_url
  ) VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    NEW.raw_user_meta_data->>'student_id',
    NEW.email,
    NEW.raw_user_meta_data->>'phone',
    COALESCE((NEW.raw_user_meta_data->>'role')::public.app_role, 'STUDENT'::public.app_role),
    COALESCE((NEW.raw_user_meta_data->>'wallet_balance')::NUMERIC, 150.00),
    NEW.raw_user_meta_data->>'avatar_url'
  )
  ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    email = EXCLUDED.email,
    updated_at = NOW();

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Trigger for auto updated_at
CREATE OR REPLACE FUNCTION public.trigger_set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS set_profiles_updated_at ON public.profiles;
CREATE TRIGGER set_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.trigger_set_updated_at();

-- ----------------------------------------------------------------------------
-- 3. MENU CATEGORIES & ITEMS
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.menu_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  display_order INTEGER NOT NULL DEFAULT 0,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

DROP TRIGGER IF EXISTS set_menu_categories_updated_at ON public.menu_categories;
CREATE TRIGGER set_menu_categories_updated_at
  BEFORE UPDATE ON public.menu_categories
  FOR EACH ROW
  EXECUTE FUNCTION public.trigger_set_updated_at();

CREATE TABLE IF NOT EXISTS public.menu_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id UUID NOT NULL REFERENCES public.menu_categories(id) ON DELETE RESTRICT,
  name TEXT NOT NULL,
  description TEXT,
  ingredients TEXT[] NOT NULL DEFAULT '{}',
  price NUMERIC(10, 2) NOT NULL CHECK (price >= 0),
  image_url TEXT,
  available BOOLEAN NOT NULL DEFAULT TRUE,
  featured BOOLEAN NOT NULL DEFAULT FALSE,
  is_veg BOOLEAN NOT NULL DEFAULT TRUE,
  preparation_time_minutes INTEGER NOT NULL DEFAULT 5 CHECK (preparation_time_minutes >= 0),
  calories INTEGER CHECK (calories IS NULL OR calories >= 0),
  serving_start TIME NOT NULL DEFAULT '07:00:00',
  serving_end TIME NOT NULL DEFAULT '21:00:00',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT chk_serving_hours CHECK (serving_start < serving_end)
);

DROP TRIGGER IF EXISTS set_menu_items_updated_at ON public.menu_items;
CREATE TRIGGER set_menu_items_updated_at
  BEFORE UPDATE ON public.menu_items
  FOR EACH ROW
  EXECUTE FUNCTION public.trigger_set_updated_at();

-- ----------------------------------------------------------------------------
-- 4. OPERATING HOURS & CANTEEN SETTINGS
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.operating_hours (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  day_of_week INTEGER NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
  service_type TEXT NOT NULL CHECK (service_type IN ('BREAKFAST', 'LUNCH', 'SNACKS', 'DINNER')),
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT chk_op_hours CHECK (start_time < end_time),
  CONSTRAINT uq_day_service UNIQUE (day_of_week, service_type)
);

CREATE TABLE IF NOT EXISTS public.canteen_settings (
  id INTEGER PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  is_open BOOLEAN NOT NULL DEFAULT TRUE,
  rush_mode BOOLEAN NOT NULL DEFAULT FALSE,
  rush_pause_orders BOOLEAN NOT NULL DEFAULT FALSE,
  current_service TEXT NOT NULL DEFAULT 'LUNCH',
  average_wait_minutes INTEGER NOT NULL DEFAULT 8,
  active_announcement TEXT,
  primary_counter TEXT NOT NULL DEFAULT 'Counter 2',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Ensure singleton settings row exists
INSERT INTO public.canteen_settings (id, is_open, current_service, average_wait_minutes)
VALUES (1, TRUE, 'LUNCH', 8)
ON CONFLICT (id) DO NOTHING;

-- ----------------------------------------------------------------------------
-- 5. TOKENS & DAILY CONCURRENCY COUNTERS
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.daily_token_counters (
  service_date DATE NOT NULL,
  prefix VARCHAR(2) NOT NULL DEFAULT 'A',
  last_number INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (service_date, prefix)
);

CREATE TABLE IF NOT EXISTS public.tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  token_number TEXT NOT NULL,
  order_id UUID, -- Will be set/linked during atomic order insertion
  service_date DATE NOT NULL DEFAULT CURRENT_DATE,
  status TEXT NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'COMPLETED', 'CANCELLED')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_daily_token UNIQUE (service_date, token_number)
);

-- ----------------------------------------------------------------------------
-- 6. ORDERS & ORDER ITEMS (WITH IMMUTABLE SNAPSHOT)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
  order_number TEXT NOT NULL UNIQUE,
  token_id UUID REFERENCES public.tokens(id) ON DELETE SET NULL,
  status public.order_status NOT NULL DEFAULT 'PLACED',
  subtotal NUMERIC(10, 2) NOT NULL CHECK (subtotal >= 0),
  discount NUMERIC(10, 2) NOT NULL DEFAULT 0.00 CHECK (discount >= 0),
  tax NUMERIC(10, 2) NOT NULL DEFAULT 0.00 CHECK (tax >= 0),
  packaging_fee NUMERIC(10, 2) NOT NULL DEFAULT 0.00 CHECK (packaging_fee >= 0),
  total NUMERIC(10, 2) NOT NULL CHECK (total >= 0),
  payment_method public.payment_method_type NOT NULL DEFAULT 'CAMPUS_PAY',
  payment_status TEXT NOT NULL DEFAULT 'PENDING' CHECK (payment_status IN ('PAID', 'PENDING', 'REFUNDED')),
  dining_type public.dining_type_enum NOT NULL DEFAULT 'DINE_IN',
  counter_id TEXT NOT NULL DEFAULT 'Counter 2',
  counter_bay TEXT NOT NULL DEFAULT 'Pickup Bay 2',
  special_instructions TEXT,
  estimated_prep_minutes INTEGER NOT NULL DEFAULT 8 CHECK (estimated_prep_minutes >= 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  cancelled_at TIMESTAMPTZ,
  cancellation_reason TEXT,
  completed_at TIMESTAMPTZ
);

-- Link tokens.order_id back to orders.id
ALTER TABLE public.tokens 
  DROP CONSTRAINT IF EXISTS fk_tokens_order,
  ADD CONSTRAINT fk_tokens_order FOREIGN KEY (order_id) REFERENCES public.orders(id) ON DELETE CASCADE;

DROP TRIGGER IF EXISTS set_orders_updated_at ON public.orders;
CREATE TRIGGER set_orders_updated_at
  BEFORE UPDATE ON public.orders
  FOR EACH ROW
  EXECUTE FUNCTION public.trigger_set_updated_at();

-- Order items with historical snapshot fields
CREATE TABLE IF NOT EXISTS public.order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  menu_item_id UUID REFERENCES public.menu_items(id) ON DELETE SET NULL,
  item_name TEXT NOT NULL,                -- IMMUTABLE SNAPSHOT
  item_description TEXT,                  -- IMMUTABLE SNAPSHOT
  unit_price NUMERIC(10, 2) NOT NULL CHECK (unit_price >= 0), -- IMMUTABLE SNAPSHOT
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  selected_addons JSONB NOT NULL DEFAULT '[]'::jsonb,
  subtotal NUMERIC(10, 2) NOT NULL CHECK (subtotal >= 0),     -- IMMUTABLE SNAPSHOT
  special_instructions TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ----------------------------------------------------------------------------
-- 7. ORDER STATUS AUDIT HISTORY
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.order_status_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  old_status public.order_status,
  new_status public.order_status NOT NULL,
  changed_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ----------------------------------------------------------------------------
-- 8. INVENTORY & TRANSACTIONS
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.inventory (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ingredient_name TEXT NOT NULL UNIQUE,
  category TEXT NOT NULL DEFAULT 'General',
  quantity NUMERIC(10, 2) NOT NULL DEFAULT 0 CHECK (quantity >= 0),
  unit TEXT NOT NULL, -- 'kg', 'liters', 'servings', 'pcs'
  minimum_quantity NUMERIC(10, 2) NOT NULL DEFAULT 0 CHECK (minimum_quantity >= 0),
  status public.inventory_status NOT NULL GENERATED ALWAYS AS (
    CASE 
      WHEN quantity <= 0 THEN 'OUT_OF_STOCK'::public.inventory_status
      WHEN quantity <= minimum_quantity THEN 'LOW'::public.inventory_status
      ELSE 'HEALTHY'::public.inventory_status
    END
  ) STORED,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

DROP TRIGGER IF EXISTS set_inventory_updated_at ON public.inventory;
CREATE TRIGGER set_inventory_updated_at
  BEFORE UPDATE ON public.inventory
  FOR EACH ROW
  EXECUTE FUNCTION public.trigger_set_updated_at();

CREATE TABLE IF NOT EXISTS public.inventory_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  inventory_id UUID NOT NULL REFERENCES public.inventory(id) ON DELETE RESTRICT,
  transaction_type TEXT NOT NULL CHECK (transaction_type IN ('PURCHASE_RESTOCK', 'ORDER_CONSUMPTION', 'WASTAGE', 'CORRECTION')),
  quantity_delta NUMERIC(10, 2) NOT NULL,
  previous_quantity NUMERIC(10, 2) NOT NULL,
  new_quantity NUMERIC(10, 2) NOT NULL,
  reason TEXT NOT NULL,
  performed_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ----------------------------------------------------------------------------
-- 9. NOTIFICATIONS & FEEDBACK
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE, -- NULL = broadcast to all campus
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type public.notification_type NOT NULL DEFAULT 'ORDER_UPDATE',
  order_id UUID REFERENCES public.orders(id) ON DELETE SET NULL,
  token_number TEXT,
  read BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  order_id UUID NOT NULL UNIQUE REFERENCES public.orders(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  food_quality INTEGER CHECK (food_quality BETWEEN 1 AND 5),
  waiting_time INTEGER CHECK (waiting_time BETWEEN 1 AND 5),
  staff_behaviour INTEGER CHECK (staff_behaviour BETWEEN 1 AND 5),
  cleanliness INTEGER CHECK (cleanliness BETWEEN 1 AND 5),
  category public.feedback_category NOT NULL DEFAULT 'OVERALL',
  comment TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ----------------------------------------------------------------------------
-- 10. INDEXES FOR PERFORMANCE
-- ----------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_menu_items_category ON public.menu_items(category_id);
CREATE INDEX IF NOT EXISTS idx_menu_items_available ON public.menu_items(available);
CREATE INDEX IF NOT EXISTS idx_menu_items_serving ON public.menu_items(serving_start, serving_end);

CREATE INDEX IF NOT EXISTS idx_orders_user_id ON public.orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON public.orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_token_id ON public.orders(token_id);

CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON public.order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_tokens_service_date ON public.tokens(service_date, token_number);
CREATE INDEX IF NOT EXISTS idx_order_status_history_order ON public.order_status_history(order_id, created_at);

CREATE INDEX IF NOT EXISTS idx_notifications_user_unread ON public.notifications(user_id, read, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_feedback_order ON public.feedback(order_id);
CREATE INDEX IF NOT EXISTS idx_inventory_status ON public.inventory(status);
