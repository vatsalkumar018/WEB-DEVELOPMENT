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
-- ============================================================================
-- CANTEEN MANAGEMENT SYSTEM - ROW LEVEL SECURITY (RLS) POLICIES
-- Migration: 20261109000002_rls_policies.sql
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.menu_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.operating_hours ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.canteen_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_token_counters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_status_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feedback ENABLE ROW LEVEL SECURITY;

-- ----------------------------------------------------------------------------
-- 1. PROFILES POLICIES
-- ----------------------------------------------------------------------------
-- Anyone authenticated can view their own profile; staff & admin can view any profile
CREATE POLICY "profiles_select_policy"
  ON public.profiles
  FOR SELECT
  TO authenticated
  USING (
    id = auth.uid() OR
    public.get_user_role(auth.uid()) IN ('STAFF', 'ADMIN')
  );

-- Users can update their own personal info (excluding role and wallet_balance which require admin/triggers)
CREATE POLICY "profiles_update_own_policy"
  ON public.profiles
  FOR UPDATE
  TO authenticated
  USING (id = auth.uid())
  WITH CHECK (
    id = auth.uid() AND
    role = (SELECT role FROM public.profiles WHERE id = auth.uid()) -- prevent privilege escalation
  );

-- Admin can manage all profiles
CREATE POLICY "profiles_admin_manage_policy"
  ON public.profiles
  FOR ALL
  TO authenticated
  USING (public.get_user_role(auth.uid()) = 'ADMIN');

-- ----------------------------------------------------------------------------
-- 2. MENU CATEGORIES POLICIES
-- ----------------------------------------------------------------------------
-- Public read access for active categories
CREATE POLICY "menu_categories_select_policy"
  ON public.menu_categories
  FOR SELECT
  TO public
  USING (active = TRUE OR public.get_user_role(auth.uid()) IN ('STAFF', 'ADMIN'));

-- Admin full control
CREATE POLICY "menu_categories_admin_policy"
  ON public.menu_categories
  FOR ALL
  TO authenticated
  USING (public.get_user_role(auth.uid()) = 'ADMIN');

-- ----------------------------------------------------------------------------
-- 3. MENU ITEMS POLICIES
-- ----------------------------------------------------------------------------
-- Public read access for menu items
CREATE POLICY "menu_items_select_policy"
  ON public.menu_items
  FOR SELECT
  TO public
  USING (
    available = TRUE OR
    public.get_user_role(auth.uid()) IN ('STAFF', 'ADMIN')
  );

-- Staff can update availability only
CREATE POLICY "menu_items_staff_availability_policy"
  ON public.menu_items
  FOR UPDATE
  TO authenticated
  USING (public.get_user_role(auth.uid()) = 'STAFF')
  WITH CHECK (public.get_user_role(auth.uid()) = 'STAFF');

-- Admin full control
CREATE POLICY "menu_items_admin_policy"
  ON public.menu_items
  FOR ALL
  TO authenticated
  USING (public.get_user_role(auth.uid()) = 'ADMIN');

-- ----------------------------------------------------------------------------
-- 4. OPERATING HOURS & CANTEEN SETTINGS POLICIES
-- ----------------------------------------------------------------------------
CREATE POLICY "operating_hours_select_policy"
  ON public.operating_hours
  FOR SELECT
  TO public
  USING (TRUE);

CREATE POLICY "operating_hours_admin_policy"
  ON public.operating_hours
  FOR ALL
  TO authenticated
  USING (public.get_user_role(auth.uid()) = 'ADMIN');

CREATE POLICY "canteen_settings_select_policy"
  ON public.canteen_settings
  FOR SELECT
  TO public
  USING (TRUE);

-- Staff can update operational rush mode & wait minutes
CREATE POLICY "canteen_settings_staff_update_policy"
  ON public.canteen_settings
  FOR UPDATE
  TO authenticated
  USING (public.get_user_role(auth.uid()) IN ('STAFF', 'ADMIN'))
  WITH CHECK (public.get_user_role(auth.uid()) IN ('STAFF', 'ADMIN'));

-- ----------------------------------------------------------------------------
-- 5. ORDERS POLICIES
-- ----------------------------------------------------------------------------
-- Students see own orders; staff/admin see all operational orders
CREATE POLICY "orders_select_policy"
  ON public.orders
  FOR SELECT
  TO authenticated
  USING (
    user_id = auth.uid() OR
    public.get_user_role(auth.uid()) IN ('STAFF', 'ADMIN')
  );

-- Only student placing the order can insert (also handled atomically by stored procedure)
CREATE POLICY "orders_insert_policy"
  ON public.orders
  FOR INSERT
  TO authenticated
  WITH CHECK (
    user_id = auth.uid() AND
    public.get_user_role(auth.uid()) = 'STUDENT'
  );

-- Students can ONLY update their own order if cancelling while still PLACED
CREATE POLICY "orders_student_cancel_policy"
  ON public.orders
  FOR UPDATE
  TO authenticated
  USING (
    user_id = auth.uid() AND
    status = 'PLACED'
  )
  WITH CHECK (
    user_id = auth.uid() AND
    status = 'CANCELLED'
  );

-- Staff and Admin can update order status (transitions enforced by trigger)
CREATE POLICY "orders_staff_update_policy"
  ON public.orders
  FOR UPDATE
  TO authenticated
  USING (public.get_user_role(auth.uid()) IN ('STAFF', 'ADMIN'))
  WITH CHECK (public.get_user_role(auth.uid()) IN ('STAFF', 'ADMIN'));

-- Admin only can delete orders
CREATE POLICY "orders_admin_delete_policy"
  ON public.orders
  FOR DELETE
  TO authenticated
  USING (public.get_user_role(auth.uid()) = 'ADMIN');

-- ----------------------------------------------------------------------------
-- 6. ORDER ITEMS POLICIES
-- ----------------------------------------------------------------------------
CREATE POLICY "order_items_select_policy"
  ON public.order_items
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.orders o
      WHERE o.id = order_items.order_id
        AND (o.user_id = auth.uid() OR public.get_user_role(auth.uid()) IN ('STAFF', 'ADMIN'))
    )
  );

CREATE POLICY "order_items_insert_policy"
  ON public.order_items
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.orders o
      WHERE o.id = order_items.order_id
        AND o.user_id = auth.uid()
    )
  );

-- ----------------------------------------------------------------------------
-- 7. TOKENS & ORDER STATUS HISTORY POLICIES
-- ----------------------------------------------------------------------------
CREATE POLICY "tokens_select_policy"
  ON public.tokens
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.orders o
      WHERE o.id = tokens.order_id
        AND (o.user_id = auth.uid() OR public.get_user_role(auth.uid()) IN ('STAFF', 'ADMIN'))
    )
  );

CREATE POLICY "order_status_history_select_policy"
  ON public.order_status_history
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.orders o
      WHERE o.id = order_status_history.order_id
        AND (o.user_id = auth.uid() OR public.get_user_role(auth.uid()) IN ('STAFF', 'ADMIN'))
    )
  );

-- ----------------------------------------------------------------------------
-- 8. INVENTORY & TRANSACTIONS POLICIES
-- ----------------------------------------------------------------------------
-- Only Staff and Admin can view inventory
CREATE POLICY "inventory_select_policy"
  ON public.inventory
  FOR SELECT
  TO authenticated
  USING (public.get_user_role(auth.uid()) IN ('STAFF', 'ADMIN'));

CREATE POLICY "inventory_manage_policy"
  ON public.inventory
  FOR ALL
  TO authenticated
  USING (public.get_user_role(auth.uid()) IN ('STAFF', 'ADMIN'));

CREATE POLICY "inventory_transactions_select_policy"
  ON public.inventory_transactions
  FOR SELECT
  TO authenticated
  USING (public.get_user_role(auth.uid()) IN ('STAFF', 'ADMIN'));

CREATE POLICY "inventory_transactions_insert_policy"
  ON public.inventory_transactions
  FOR INSERT
  TO authenticated
  WITH CHECK (public.get_user_role(auth.uid()) IN ('STAFF', 'ADMIN'));

-- ----------------------------------------------------------------------------
-- 9. NOTIFICATIONS POLICIES
-- ----------------------------------------------------------------------------
-- Users can only view their own notifications or campus-wide broadcasts (user_id IS NULL)
CREATE POLICY "notifications_select_policy"
  ON public.notifications
  FOR SELECT
  TO authenticated
  USING (
    user_id = auth.uid() OR
    user_id IS NULL OR
    public.get_user_role(auth.uid()) = 'ADMIN'
  );

-- Users can mark their own notifications as read
CREATE POLICY "notifications_update_policy"
  ON public.notifications
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Staff & Admin can insert notifications
CREATE POLICY "notifications_insert_policy"
  ON public.notifications
  FOR INSERT
  TO authenticated
  WITH CHECK (public.get_user_role(auth.uid()) IN ('STAFF', 'ADMIN'));

-- ----------------------------------------------------------------------------
-- 10. FEEDBACK POLICIES
-- ----------------------------------------------------------------------------
-- Users can view their own feedback; staff and admin can view all feedback
CREATE POLICY "feedback_select_policy"
  ON public.feedback
  FOR SELECT
  TO authenticated
  USING (
    user_id = auth.uid() OR
    public.get_user_role(auth.uid()) IN ('STAFF', 'ADMIN')
  );

-- Only student who owns the completed order can submit feedback
CREATE POLICY "feedback_insert_policy"
  ON public.feedback
  FOR INSERT
  TO authenticated
  WITH CHECK (
    user_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM public.orders o
      WHERE o.id = feedback.order_id
        AND o.user_id = auth.uid()
        AND o.status = 'COLLECTED'
    )
  );
-- ============================================================================
-- CANTEEN MANAGEMENT SYSTEM - ORDER STATE MACHINE & CANCELLATION ENGINE
-- Migration: 20261109000003_order_state_machine.sql
-- ============================================================================

CREATE OR REPLACE FUNCTION public.trg_enforce_order_state_machine()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_old_status public.order_status;
  v_new_status public.order_status;
  v_changed_by UUID;
  v_token_str TEXT;
BEGIN
  v_old_status := OLD.status;
  v_new_status := NEW.status;
  v_changed_by := auth.uid();

  -- If status hasn't changed, allow update
  IF v_old_status = v_new_status THEN
    RETURN NEW;
  END IF;

  -- 1. ENFORCE STATE TRANSITION RULES
  -- Allowed transitions:
  --   PLACED -> PREPARING
  --   PLACED -> CANCELLED
  --   PREPARING -> READY
  --   READY -> COLLECTED
  -- Everything else is strictly rejected.
  IF v_old_status = 'PLACED' THEN
    IF v_new_status NOT IN ('PREPARING', 'CANCELLED') THEN
      RAISE EXCEPTION 'Invalid status transition: cannot transition order % from % to %',
        NEW.order_number, v_old_status, v_new_status
        USING ERRCODE = 'P0001';
    END IF;

  ELSIF v_old_status = 'PREPARING' THEN
    IF v_new_status <> 'READY' THEN
      RAISE EXCEPTION 'Invalid status transition: Order is already in preparation and cannot transition to %',
        v_new_status
        USING ERRCODE = 'P0002';
    END IF;

  ELSIF v_old_status = 'READY' THEN
    IF v_new_status <> 'COLLECTED' THEN
      RAISE EXCEPTION 'Invalid status transition: Order is marked ready and can only be COLLECTED, not %',
        v_new_status
        USING ERRCODE = 'P0003';
    END IF;

  ELSIF v_old_status IN ('COLLECTED', 'CANCELLED') THEN
    RAISE EXCEPTION 'Terminal state violation: Order % is already % and cannot be modified',
      NEW.order_number, v_old_status
      USING ERRCODE = 'P0004';
  END IF;

  -- 2. FETCH ASSOCIATED TOKEN FOR NOTIFICATIONS & STATUS
  SELECT token_number INTO v_token_str FROM public.tokens WHERE id = NEW.token_id;

  -- 3. HANDLE SPECIFIC TRANSITION SIDE-EFFECTS
  IF v_new_status = 'PREPARING' THEN
    -- In prep: reduce estimated time if needed
    NEW.estimated_prep_minutes := GREATEST(1, NEW.estimated_prep_minutes - 3);

  ELSIF v_new_status = 'READY' THEN
    -- Mark estimated minutes 0
    NEW.estimated_prep_minutes := 0;

    -- Push real-time notification to the student
    INSERT INTO public.notifications (
      user_id,
      title,
      message,
      type,
      order_id,
      token_number
    ) VALUES (
      NEW.user_id,
      'Order Ready for Collection! 🍽️',
      format('Token #%s is ready at %s (%s). Please flash your digital token to collect.', 
        COALESCE(v_token_str, 'N/A'), NEW.counter_id, NEW.counter_bay),
      'ORDER_READY',
      NEW.id,
      v_token_str
    );

  ELSIF v_new_status = 'COLLECTED' THEN
    NEW.completed_at := NOW();

    -- Mark token completed
    IF NEW.token_id IS NOT NULL THEN
      UPDATE public.tokens SET status = 'COMPLETED' WHERE id = NEW.token_id;
    END IF;

  ELSIF v_new_status = 'CANCELLED' THEN
    NEW.cancelled_at := NOW();
    NEW.cancellation_reason := COALESCE(NEW.cancellation_reason, 'Cancelled by user prior to food preparation');

    -- Mark token cancelled
    IF NEW.token_id IS NOT NULL THEN
      UPDATE public.tokens SET status = 'CANCELLED' WHERE id = NEW.token_id;
    END IF;

    -- If payment was made via CAMPUS_PAY, refund to student wallet immediately!
    IF NEW.payment_method = 'CAMPUS_PAY' AND NEW.payment_status = 'PAID' THEN
      UPDATE public.profiles
      SET wallet_balance = wallet_balance + NEW.total
      WHERE id = NEW.user_id;

      NEW.payment_status := 'REFUNDED';

      -- Send cancellation & refund notification
      INSERT INTO public.notifications (
        user_id,
        title,
        message,
        type,
        order_id,
        token_number
      ) VALUES (
        NEW.user_id,
        'Order Cancelled & Refunded',
        format('Order #%s was cancelled. ₹%s has been refunded to your Campus Wallet.', 
          NEW.order_number, NEW.total),
        'ORDER_UPDATE',
        NEW.id,
        v_token_str
      );
    END IF;
  END IF;

  -- 4. RECORD IMMUTABLE AUDIT ENTRY IN order_status_history
  INSERT INTO public.order_status_history (
    order_id,
    old_status,
    new_status,
    changed_by,
    notes
  ) VALUES (
    NEW.id,
    v_old_status,
    v_new_status,
    v_changed_by,
    CASE 
      WHEN v_new_status = 'CANCELLED' THEN NEW.cancellation_reason
      ELSE format('Status advanced from %s to %s', v_old_status, v_new_status)
    END
  );

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_order_state_transitions ON public.orders;
CREATE TRIGGER trg_order_state_transitions
  BEFORE UPDATE OF status ON public.orders
  FOR EACH ROW
  EXECUTE FUNCTION public.trg_enforce_order_state_machine();
-- ============================================================================
-- CANTEEN MANAGEMENT SYSTEM - ATOMIC ORDERING & TOKEN GENERATION ENGINE
-- Migration: 20261109000004_atomic_order_token.sql
-- ============================================================================

-- Function: create_order_atomic
-- Purpose: Complete transaction for order creation, serving window validation,
--          concurrency-safe daily token generation, and immutable item snapshots.
CREATE OR REPLACE FUNCTION public.create_order_atomic(
  p_items JSONB,                          -- Array of: { menu_item_id: UUID, quantity: INT, selected_addons?: JSONB, special_instructions?: TEXT }
  p_dining_type TEXT DEFAULT 'DINE_IN',   -- 'DINE_IN' or 'TAKEAWAY'
  p_payment_method TEXT DEFAULT 'CAMPUS_PAY', -- 'CAMPUS_PAY', 'UPI', 'CASH_AT_COUNTER'
  p_special_instructions TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID;
  v_settings RECORD;
  v_item RECORD;
  v_item_input JSONB;
  v_item_id UUID;
  v_qty INTEGER;
  v_addons JSONB;
  v_item_notes TEXT;
  
  v_subtotal NUMERIC(10, 2) := 0.00;
  v_packaging_fee NUMERIC(10, 2) := 0.00;
  v_tax NUMERIC(10, 2) := 0.00;
  v_total NUMERIC(10, 2) := 0.00;
  v_max_prep_time INTEGER := 5;
  
  v_user_wallet NUMERIC(10, 2);
  v_payment_status TEXT := 'PENDING';
  
  v_next_token_seq INTEGER;
  v_token_number TEXT;
  v_token_id UUID;
  
  v_order_id UUID;
  v_order_number TEXT;
  v_current_time TIME := CURRENT_TIME;
BEGIN
  -- 1. VERIFY AUTHENTICATED USER
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Authentication required: User must be signed in to place an order'
      USING ERRCODE = '42501';
  END IF;

  -- 2. VERIFY CANTEEN STATUS & SETTINGS
  SELECT is_open, rush_pause_orders, average_wait_minutes, primary_counter
  INTO v_settings
  FROM public.canteen_settings
  WHERE id = 1;

  IF NOT FOUND OR NOT v_settings.is_open THEN
    RAISE EXCEPTION 'The canteen is currently closed. Please check operating hours.'
      USING ERRCODE = 'P0010';
  END IF;

  IF v_settings.rush_pause_orders THEN
    RAISE EXCEPTION 'The canteen is experiencing high order volume and has temporarily paused new orders. Please try again in 5 minutes.'
      USING ERRCODE = 'P0011';
  END IF;

  -- 3. VALIDATE ORDER PAYLOAD
  IF p_items IS NULL OR jsonb_array_length(p_items) = 0 THEN
    RAISE EXCEPTION 'Order must contain at least one item'
      USING ERRCODE = '22023';
  END IF;

  -- 4. VALIDATE EACH ITEM: AVAILABILITY, TIME WINDOW, AND PRICE CALCULATION
  FOR v_item_input IN SELECT * FROM jsonb_array_elements(p_items)
  LOOP
    v_item_id := (v_item_input->>'menu_item_id')::UUID;
    v_qty := COALESCE((v_item_input->>'quantity')::INTEGER, 1);

    IF v_qty <= 0 THEN
      RAISE EXCEPTION 'Quantity for all items must be greater than zero'
        USING ERRCODE = '22023';
    END IF;

    -- Fetch item with row share lock
    SELECT id, name, description, price, available, serving_start, serving_end, preparation_time_minutes
    INTO v_item
    FROM public.menu_items
    WHERE id = v_item_id
    FOR SHARE;

    IF NOT FOUND THEN
      RAISE EXCEPTION 'Menu item not found: %', v_item_id
        USING ERRCODE = 'P0012';
    END IF;

    -- Check availability flag
    IF NOT v_item.available THEN
      RAISE EXCEPTION 'Item "%" is currently unavailable or out of stock.', v_item.name
        USING ERRCODE = 'P0013';
    END IF;

    -- Check time-based serving hours
    IF v_current_time < v_item.serving_start OR v_current_time > v_item.serving_end THEN
      RAISE EXCEPTION 'Item "%" is only served between % and % (Current time: %)',
        v_item.name, 
        to_char(v_item.serving_start, 'HH12:MI AM'), 
        to_char(v_item.serving_end, 'HH12:MI AM'),
        to_char(v_current_time, 'HH12:MI AM')
        USING ERRCODE = 'P0014';
    END IF;

    -- Accumulate subtotal & max prep time
    v_subtotal := v_subtotal + (v_item.price * v_qty);
    v_max_prep_time := GREATEST(v_max_prep_time, v_item.preparation_time_minutes);
  END LOOP;

  -- 5. CALCULATE FEES & TOTALS
  IF p_dining_type = 'TAKEAWAY' THEN
    v_packaging_fee := 10.00; -- Standard eco-packaging fee
  END IF;

  v_total := v_subtotal + v_packaging_fee + v_tax;

  -- 6. VERIFY & DEDUCT PAYMENT
  IF p_payment_method = 'CAMPUS_PAY' THEN
    SELECT wallet_balance INTO v_user_wallet
    FROM public.profiles
    WHERE id = v_user_id
    FOR UPDATE;

    IF v_user_wallet < v_total THEN
      RAISE EXCEPTION 'Insufficient campus wallet balance. Order total: ₹%, Available balance: ₹%',
        v_total, v_user_wallet
        USING ERRCODE = 'P0015';
    END IF;

    -- Deduct balance atomically
    UPDATE public.profiles
    SET wallet_balance = wallet_balance - v_total
    WHERE id = v_user_id;

    v_payment_status := 'PAID';
  ELSE
    v_payment_status := 'PENDING';
  END IF;

  -- 7. GENERATE CONCURRENCY-SAFE DAILY SEQUENTIAL TOKEN
  -- We lock the daily counter row for today's service with FOR UPDATE
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

  -- Create token record
  INSERT INTO public.tokens (
    token_number,
    service_date,
    status
  ) VALUES (
    v_token_number,
    CURRENT_DATE,
    'ACTIVE'
  )
  RETURNING id INTO v_token_id;

  -- 8. GENERATE ORDER NUMBER & INSERT ORDER
  v_order_number := format('ORD-%s-%s', to_char(CURRENT_DATE, 'YYYYMMDD'), lpad(v_next_token_seq::text, 4, '0'));

  INSERT INTO public.orders (
    user_id,
    order_number,
    token_id,
    status,
    subtotal,
    discount,
    tax,
    packaging_fee,
    total,
    payment_method,
    payment_status,
    dining_type,
    counter_id,
    counter_bay,
    special_instructions,
    estimated_prep_minutes
  ) VALUES (
    v_user_id,
    v_order_number,
    v_token_id,
    'PLACED',
    v_subtotal,
    0.00,
    v_tax,
    v_packaging_fee,
    v_total,
    p_payment_method::public.payment_method_type,
    v_payment_status,
    p_dining_type::public.dining_type_enum,
    COALESCE(v_settings.primary_counter, 'Counter 2'),
    'Pickup Bay 2',
    p_special_instructions,
    v_max_prep_time
  )
  RETURNING id INTO v_order_id;

  -- Backlink order_id to token
  UPDATE public.tokens
  SET order_id = v_order_id
  WHERE id = v_token_id;

  -- 9. INSERT ORDER ITEMS AS IMMUTABLE HISTORICAL SNAPSHOTS
  FOR v_item_input IN SELECT * FROM jsonb_array_elements(p_items)
  LOOP
    v_item_id := (v_item_input->>'menu_item_id')::UUID;
    v_qty := COALESCE((v_item_input->>'quantity')::INTEGER, 1);
    v_addons := COALESCE(v_item_input->'selected_addons', '[]'::jsonb);
    v_item_notes := v_item_input->>'special_instructions';

    SELECT name, description, price
    INTO v_item
    FROM public.menu_items
    WHERE id = v_item_id;

    INSERT INTO public.order_items (
      order_id,
      menu_item_id,
      item_name,
      item_description,
      unit_price,
      quantity,
      selected_addons,
      subtotal,
      special_instructions
    ) VALUES (
      v_order_id,
      v_item_id,
      v_item.name,
      v_item.description,
      v_item.price,
      v_qty,
      v_addons,
      (v_item.price * v_qty),
      v_item_notes
    );
  END LOOP;

  -- 10. INSERT INITIAL AUDIT HISTORY
  INSERT INTO public.order_status_history (
    order_id,
    old_status,
    new_status,
    changed_by,
    notes
  ) VALUES (
    v_order_id,
    NULL,
    'PLACED',
    v_user_id,
    'Order confirmed and token issued'
  );

  -- 11. SEND INITIAL CONFIRMATION NOTIFICATION
  INSERT INTO public.notifications (
    user_id,
    title,
    message,
    type,
    order_id,
    token_number
  ) VALUES (
    v_user_id,
    format('Order Confirmed (#%s)', v_token_number),
    format('Your token is #%s. Kitchen has received your order for %s items (₹%s).',
      v_token_number, jsonb_array_length(p_items), v_total),
    'ORDER_UPDATE',
    v_order_id,
    v_token_number
  );

  -- 12. RETURN ORDER DETAILS AS JSONB
  RETURN jsonb_build_object(
    'success', true,
    'order_id', v_order_id,
    'order_number', v_order_number,
    'token_id', v_token_id,
    'token_number', v_token_number,
    'subtotal', v_subtotal,
    'packaging_fee', v_packaging_fee,
    'total', v_total,
    'status', 'PLACED',
    'dining_type', p_dining_type,
    'payment_method', p_payment_method,
    'payment_status', v_payment_status,
    'estimated_prep_minutes', v_max_prep_time,
    'created_at', NOW()
  );
END;
$$;


-- Function: cancel_order_student
-- Purpose: Allows students to safely cancel their order ONLY while still in PLACED status.
CREATE OR REPLACE FUNCTION public.cancel_order_student(
  p_order_id UUID,
  p_reason TEXT DEFAULT 'Cancelled by student'
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID;
  v_order RECORD;
  v_role public.app_role;
BEGIN
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Authentication required' USING ERRCODE = '42501';
  END IF;

  SELECT role INTO v_role FROM public.profiles WHERE id = v_user_id;

  -- Fetch order with row lock
  SELECT id, user_id, order_number, status, total, payment_method, payment_status, token_id
  INTO v_order
  FROM public.orders
  WHERE id = p_order_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Order not found' USING ERRCODE = 'P0020';
  END IF;

  -- Ensure caller is order owner or staff/admin
  IF v_order.user_id <> v_user_id AND v_role NOT IN ('STAFF', 'ADMIN') THEN
    RAISE EXCEPTION 'Access denied: You can only cancel your own orders' USING ERRCODE = '42501';
  END IF;

  -- Enforce cancellation rule: ONLY permitted while PLACED
  IF v_order.status = 'PREPARING' THEN
    RAISE EXCEPTION 'Order #% cannot be cancelled because the kitchen has already started preparing your food.',
      v_order.order_number
      USING ERRCODE = 'P0021';
  ELSIF v_order.status IN ('READY', 'COLLECTED') THEN
    RAISE EXCEPTION 'Order #% cannot be cancelled because it is already ready or collected.',
      v_order.order_number
      USING ERRCODE = 'P0022';
  ELSIF v_order.status = 'CANCELLED' THEN
    RAISE EXCEPTION 'Order #% is already cancelled.',
      v_order.order_number
      USING ERRCODE = 'P0023';
  END IF;

  -- Apply cancellation. The state machine trigger handles status_history and wallet refund automatically!
  UPDATE public.orders
  SET 
    status = 'CANCELLED',
    cancellation_reason = COALESCE(p_reason, 'Student cancelled from app')
  WHERE id = p_order_id;

  RETURN jsonb_build_object(
    'success', true,
    'order_id', p_order_id,
    'status', 'CANCELLED',
    'message', 'Order cancelled successfully and any wallet deductions refunded.'
  );
END;
$$;


-- Function: get_canteen_live_status
-- Purpose: Public/Student summary of live canteen queues, wait times, and current tokens.
CREATE OR REPLACE FUNCTION public.get_canteen_live_status()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
DECLARE
  v_settings RECORD;
  v_active_orders INTEGER;
  v_preparing_orders INTEGER;
  v_ready_orders INTEGER;
  v_latest_ready_token TEXT;
  v_latest_prep_token TEXT;
BEGIN
  SELECT is_open, rush_mode, rush_pause_orders, current_service, average_wait_minutes, active_announcement, primary_counter
  INTO v_settings
  FROM public.canteen_settings
  WHERE id = 1;

  SELECT COUNT(*) INTO v_active_orders
  FROM public.orders
  WHERE status IN ('PLACED', 'PREPARING');

  SELECT COUNT(*) INTO v_preparing_orders
  FROM public.orders
  WHERE status = 'PREPARING';

  SELECT COUNT(*) INTO v_ready_orders
  FROM public.orders
  WHERE status = 'READY';

  -- Latest ready token
  SELECT t.token_number INTO v_latest_ready_token
  FROM public.orders o
  JOIN public.tokens t ON o.token_id = t.id
  WHERE o.status = 'READY'
  ORDER BY o.updated_at DESC
  LIMIT 1;

  -- Latest preparing token
  SELECT t.token_number INTO v_latest_prep_token
  FROM public.orders o
  JOIN public.tokens t ON o.token_id = t.id
  WHERE o.status = 'PREPARING'
  ORDER BY o.updated_at DESC
  LIMIT 1;

  RETURN jsonb_build_object(
    'is_open', COALESCE(v_settings.is_open, true),
    'rush_mode', COALESCE(v_settings.rush_mode, false),
    'rush_pause_orders', COALESCE(v_settings.rush_pause_orders, false),
    'current_service', COALESCE(v_settings.current_service, 'LUNCH'),
    'average_wait_minutes', COALESCE(v_settings.average_wait_minutes, 8),
    'active_announcement', v_settings.active_announcement,
    'primary_counter', COALESCE(v_settings.primary_counter, 'Counter 2'),
    'active_orders_count', v_active_orders,
    'preparing_orders_count', v_preparing_orders,
    'ready_orders_count', v_ready_orders,
    'latest_ready_token', v_latest_ready_token,
    'latest_preparing_token', v_latest_prep_token
  );
END;
$$;
-- ============================================================================
-- CANTEEN MANAGEMENT SYSTEM - SUPABASE REALTIME & STORAGE CONFIGURATION
-- Migration: 20261109000005_realtime_storage.sql
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. REALTIME REPLICATION CONFIGURATION
-- ----------------------------------------------------------------------------
-- Set replica identity to FULL so realtime listeners receive old & new payloads
ALTER TABLE public.orders REPLICA IDENTITY FULL;
ALTER TABLE public.tokens REPLICA IDENTITY FULL;
ALTER TABLE public.notifications REPLICA IDENTITY FULL;
ALTER TABLE public.canteen_settings REPLICA IDENTITY FULL;
ALTER TABLE public.order_status_history REPLICA IDENTITY FULL;
ALTER TABLE public.menu_items REPLICA IDENTITY FULL;

-- Add tables to the supabase_realtime publication
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'orders'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.orders;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'tokens'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.tokens;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'notifications'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'canteen_settings'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.canteen_settings;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'order_status_history'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.order_status_history;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'menu_items'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.menu_items;
  END IF;
END $$;


-- ----------------------------------------------------------------------------
-- 2. STORAGE BUCKETS SETUP
-- ----------------------------------------------------------------------------
-- Buckets:
--   1. 'menu-images': Publicly readable for dish photos.
--   2. 'profile-avatars': Publicly readable / user-specific write.

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
  ('menu-images', 'menu-images', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml']),
  ('profile-avatars', 'profile-avatars', true, 2097152, ARRAY['image/jpeg', 'image/png', 'image/webp'])
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- ----------------------------------------------------------------------------
-- 3. STORAGE RLS POLICIES
-- ----------------------------------------------------------------------------

-- A. Menu Images Bucket: Public Read
DROP POLICY IF EXISTS "Public can view menu images" ON storage.objects;
CREATE POLICY "Public can view menu images"
  ON storage.objects
  FOR SELECT
  USING (bucket_id = 'menu-images');

-- Menu Images Bucket: Admin & Staff can upload/modify
DROP POLICY IF EXISTS "Staff and Admin can upload menu images" ON storage.objects;
CREATE POLICY "Staff and Admin can upload menu images"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'menu-images' AND
    public.get_user_role(auth.uid()) IN ('STAFF', 'ADMIN')
  );

DROP POLICY IF EXISTS "Staff and Admin can update menu images" ON storage.objects;
CREATE POLICY "Staff and Admin can update menu images"
  ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'menu-images' AND
    public.get_user_role(auth.uid()) IN ('STAFF', 'ADMIN')
  );

DROP POLICY IF EXISTS "Staff and Admin can delete menu images" ON storage.objects;
CREATE POLICY "Staff and Admin can delete menu images"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'menu-images' AND
    public.get_user_role(auth.uid()) IN ('STAFF', 'ADMIN')
  );

-- B. Profile Avatars Bucket: Public Read
DROP POLICY IF EXISTS "Public can view profile avatars" ON storage.objects;
CREATE POLICY "Public can view profile avatars"
  ON storage.objects
  FOR SELECT
  USING (bucket_id = 'profile-avatars');

-- Users can upload their own avatar
DROP POLICY IF EXISTS "Users can upload their own avatar" ON storage.objects;
CREATE POLICY "Users can upload their own avatar"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'profile-avatars' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

DROP POLICY IF EXISTS "Users can update their own avatar" ON storage.objects;
CREATE POLICY "Users can update their own avatar"
  ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'profile-avatars' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

DROP POLICY IF EXISTS "Users can delete their own avatar" ON storage.objects;
CREATE POLICY "Users can delete their own avatar"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'profile-avatars' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );
-- ============================================================================
-- CANTEEN MANAGEMENT SYSTEM - ANALYTICS VIEWS & STORED PROCEDURES
-- Migration: 20261109000006_analytics_views.sql
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. KITCHEN DISPLAY SYSTEM (KDS) ACTIVE VIEW
-- ----------------------------------------------------------------------------
CREATE OR REPLACE VIEW public.v_kitchen_active_orders AS
SELECT 
  o.id AS order_id,
  o.order_number,
  t.token_number,
  o.status,
  o.dining_type,
  o.special_instructions,
  o.estimated_prep_minutes,
  o.created_at,
  ROUND(EXTRACT(EPOCH FROM (NOW() - o.created_at)) / 60) AS elapsed_minutes,
  COALESCE(
    (
      SELECT jsonb_agg(
        jsonb_build_object(
          'id', oi.id,
          'item_name', oi.item_name,
          'quantity', oi.quantity,
          'selected_addons', oi.selected_addons,
          'special_instructions', oi.special_instructions
        )
      )
      FROM public.order_items oi
      WHERE oi.order_id = o.id
    ),
    '[]'::jsonb
  ) AS items
FROM public.orders o
LEFT JOIN public.tokens t ON o.token_id = t.id
WHERE o.status IN ('PLACED', 'PREPARING', 'READY')
ORDER BY 
  CASE o.status
    WHEN 'PLACED' THEN 1
    WHEN 'PREPARING' THEN 2
    WHEN 'READY' THEN 3
    ELSE 4
  END,
  o.created_at ASC;

-- Grant select on kitchen view
GRANT SELECT ON public.v_kitchen_active_orders TO authenticated;


-- ----------------------------------------------------------------------------
-- 2. ADMIN ANALYTICS FUNCTION: get_admin_analytics
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.get_admin_analytics(p_date DATE DEFAULT CURRENT_DATE)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
DECLARE
  v_caller_role public.app_role;
  v_today_sales NUMERIC(10, 2) := 0.00;
  v_total_orders INTEGER := 0;
  v_completed_orders INTEGER := 0;
  v_cancelled_orders INTEGER := 0;
  v_avg_order_value NUMERIC(10, 2) := 0.00;
  v_peak_hour TEXT := '12:00 PM - 01:00 PM';
  v_peak_hour_count INTEGER := 0;
  v_most_ordered_item TEXT := 'None';
  v_most_ordered_count INTEGER := 0;
  v_low_stock_count INTEGER := 0;
  
  v_hourly_orders JSONB;
  v_popular_items JSONB;
  v_category_stats JSONB;
  v_payment_stats JSONB;
BEGIN
  -- Verify caller is STAFF or ADMIN
  v_caller_role := public.get_user_role(auth.uid());
  IF v_caller_role NOT IN ('STAFF', 'ADMIN') THEN
    RAISE EXCEPTION 'Access denied: Analytics are restricted to canteen managers'
      USING ERRCODE = '42501';
  END IF;

  -- 1. Daily Core Metrics
  SELECT 
    COALESCE(SUM(CASE WHEN status <> 'CANCELLED' THEN total ELSE 0 END), 0.00),
    COUNT(*),
    COUNT(CASE WHEN status = 'COLLECTED' THEN 1 END),
    COUNT(CASE WHEN status = 'CANCELLED' THEN 1 END),
    COALESCE(ROUND(AVG(CASE WHEN status <> 'CANCELLED' THEN total END), 2), 0.00)
  INTO 
    v_today_sales,
    v_total_orders,
    v_completed_orders,
    v_cancelled_orders,
    v_avg_order_value
  FROM public.orders
  WHERE created_at::DATE = p_date;

  -- 2. Peak Hour Determination
  SELECT 
    to_char(date_trunc('hour', created_at), 'HH12:00 AM') || ' - ' || to_char(date_trunc('hour', created_at) + INTERVAL '1 hour', 'HH12:00 AM'),
    COUNT(*)
  INTO v_peak_hour, v_peak_hour_count
  FROM public.orders
  WHERE created_at::DATE = p_date AND status <> 'CANCELLED'
  GROUP BY date_trunc('hour', created_at)
  ORDER BY COUNT(*) DESC
  LIMIT 1;

  -- 3. Most Ordered Item
  SELECT oi.item_name, SUM(oi.quantity)
  INTO v_most_ordered_item, v_most_ordered_count
  FROM public.order_items oi
  JOIN public.orders o ON oi.order_id = o.id
  WHERE o.created_at::DATE = p_date AND o.status <> 'CANCELLED'
  GROUP BY oi.item_name
  ORDER BY SUM(oi.quantity) DESC
  LIMIT 1;

  -- 4. Low stock count
  SELECT COUNT(*) INTO v_low_stock_count
  FROM public.inventory
  WHERE status IN ('LOW', 'OUT_OF_STOCK');

  -- 5. Orders by Hour
  WITH hours AS (
    SELECT generate_series(
      p_date + TIME '07:00:00',
      p_date + TIME '21:00:00',
      INTERVAL '1 hour'
    ) AS hr
  )
  SELECT jsonb_agg(
    jsonb_build_object(
      'hour', to_char(h.hr, 'HH12 AM'),
      'orders', COUNT(o.id),
      'revenue', COALESCE(SUM(CASE WHEN o.status <> 'CANCELLED' THEN o.total ELSE 0 END), 0)
    ) ORDER BY h.hr
  )
  INTO v_hourly_orders
  FROM hours h
  LEFT JOIN public.orders o 
    ON date_trunc('hour', o.created_at) = h.hr
  GROUP BY h.hr;

  -- 6. Top 5 Popular Foods
  SELECT jsonb_agg(
    jsonb_build_object(
      'name', oi.item_name,
      'quantity', SUM(oi.quantity),
      'revenue', SUM(oi.subtotal)
    ) ORDER BY SUM(oi.quantity) DESC
  )
  INTO v_popular_items
  FROM (
    SELECT oi.item_name, oi.quantity, oi.subtotal
    FROM public.order_items oi
    JOIN public.orders o ON oi.order_id = o.id
    WHERE o.created_at::DATE = p_date AND o.status <> 'CANCELLED'
    LIMIT 100
  ) oi
  GROUP BY oi.item_name
  LIMIT 5;

  -- 7. Category Breakdown
  SELECT jsonb_agg(
    jsonb_build_object(
      'category', COALESCE(c.name, 'Other'),
      'orders_count', COUNT(oi.id),
      'revenue', SUM(oi.subtotal)
    )
  )
  INTO v_category_stats
  FROM public.order_items oi
  JOIN public.orders o ON oi.order_id = o.id
  LEFT JOIN public.menu_items m ON oi.menu_item_id = m.id
  LEFT JOIN public.menu_categories c ON m.category_id = c.id
  WHERE o.created_at::DATE = p_date AND o.status <> 'CANCELLED'
  GROUP BY c.name;

  -- 8. Payment Method Breakdown
  SELECT jsonb_agg(
    jsonb_build_object(
      'method', o.payment_method,
      'count', COUNT(*),
      'total', SUM(o.total)
    )
  )
  INTO v_payment_stats
  FROM public.orders o
  WHERE o.created_at::DATE = p_date AND o.status <> 'CANCELLED'
  GROUP BY o.payment_method;

  RETURN jsonb_build_object(
    'date', p_date,
    'today_sales', v_today_sales,
    'total_orders', v_total_orders,
    'completed_orders', v_completed_orders,
    'cancelled_orders', v_cancelled_orders,
    'average_order_value', v_avg_order_value,
    'peak_hour', COALESCE(v_peak_hour, '12:00 PM - 01:00 PM'),
    'most_ordered_item', COALESCE(v_most_ordered_item, 'Special Thali'),
    'low_stock_count', v_low_stock_count,
    'hourly_orders', COALESCE(v_hourly_orders, '[]'::jsonb),
    'popular_items', COALESCE(v_popular_items, '[]'::jsonb),
    'category_stats', COALESCE(v_category_stats, '[]'::jsonb),
    'payment_stats', COALESCE(v_payment_stats, '[]'::jsonb)
  );
END;
$$;
-- ============================================================================
-- CANTEEN MANAGEMENT SYSTEM - COMPREHENSIVE SEED DATA
-- Migration: 20261109000007_seed_data.sql
-- ============================================================================

-- 1. SEED MENU CATEGORIES
INSERT INTO public.menu_categories (id, name, slug, description, display_order, active)
VALUES
  ('c1000000-0000-0000-0000-000000000001', 'Meals', 'meals', 'Nutritious, authentic thalis and lunch Combos', 1, true),
  ('c1000000-0000-0000-0000-000000000002', 'Beverages', 'beverages', 'Hot teas, artisanal coffees, and chilled coolers', 2, true),
  ('c1000000-0000-0000-0000-000000000003', 'Snacks', 'snacks', 'Quick bites, samosas, rolls, and quick street food', 3, true),
  ('c1000000-0000-0000-0000-000000000004', 'Desserts', 'desserts', 'Traditional Indian sweets and baked confections', 4, true)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  display_order = EXCLUDED.display_order;

-- 2. SEED MENU ITEMS
INSERT INTO public.menu_items (
  id, category_id, name, description, ingredients, price, image_url,
  available, featured, is_veg, preparation_time_minutes, calories, serving_start, serving_end
) VALUES
  -- Meals
  (
    'm1000000-0000-0000-0000-000000000001',
    'c1000000-0000-0000-0000-000000000001',
    'Special Veg Thali',
    'Complete North Indian platter with 2 sabzis (Paneer & Mixed Veg), Dal Tadka, Jeera Rice, 3 Butter Rotis, Gulab Jamun, and Papad.',
    ARRAY['Paneer', 'Mixed Vegetables', 'Toor Dal', 'Basmati Rice', 'Whole Wheat', 'Ghee', 'Gulab Jamun'],
    90.00,
    'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&q=80&w=800',
    true, true, true, 8, 680, '11:00:00', '21:00:00'
  ),
  (
    'm1000000-0000-0000-0000-000000000002',
    'c1000000-0000-0000-0000-000000000001',
    'Paneer Butter Masala Combo',
    'Rich and creamy tomato gravy with cottage cheese cubes, served with 2 layered Laccha Parathas and spicy mint chutney.',
    ARRAY['Cottage Cheese', 'Butter', 'Cream', 'Tomatoes', 'Wheat Flour', 'Spices'],
    110.00,
    'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?auto=format&fit=crop&q=80&w=800',
    true, true, true, 10, 720, '11:00:00', '21:00:00'
  ),
  (
    'm1000000-0000-0000-0000-000000000003',
    'c1000000-0000-0000-0000-000000000001',
    'Crispy Masala Dosa',
    'Golden fermented crepe stuffed with spiced potato mash, accompanied by steaming drumstick Sambhar and fresh coconut chutney.',
    ARRAY['Rice Batter', 'Urad Dal', 'Potatoes', 'Mustard Seeds', 'Curry Leaves', 'Coconut'],
    60.00,
    'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&q=80&w=800',
    true, false, true, 6, 380, '07:00:00', '21:00:00'
  ),
  (
    'm1000000-0000-0000-0000-000000000004',
    'c1000000-0000-0000-0000-000000000001',
    'Delhi Chole Bhature',
    'Two puffed golden bhaturas served with slow-cooked pindi chole, pickled green chillies, and fresh onion rings.',
    ARRAY['Chickpeas', 'Refined Flour', 'Spices', 'Yogurt', 'Pickle'],
    75.00,
    'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?auto=format&fit=crop&q=80&w=800',
    true, true, true, 7, 620, '07:00:00', '16:00:00'
  ),
  (
    'm1000000-0000-0000-0000-000000000005',
    'c1000000-0000-0000-0000-000000000001',
    'Dum Veg Biryani',
    'Slow-cooked fragrant basmati rice infused with whole spices, saffron, and fresh vegetables. Served with chilled cucumber raita.',
    ARRAY['Basmati Rice', 'Carrots', 'Beans', 'Green Peas', 'Saffron', 'Mint', 'Yogurt'],
    95.00,
    'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&q=80&w=800',
    true, false, true, 8, 540, '11:00:00', '21:00:00'
  ),

  -- Beverages
  (
    'm1000000-0000-0000-0000-000000000006',
    'c1000000-0000-0000-0000-000000000002',
    'Adrak Elaichi Cutting Chai',
    'Freshly brewed Assam CTC tea simmered with hand-crushed ginger, green cardamom pods, and farm-fresh whole milk.',
    ARRAY['Assam Tea', 'Fresh Ginger', 'Cardamom', 'Whole Milk', 'Jaggery/Sugar'],
    15.00,
    'https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&q=80&w=800',
    true, true, true, 3, 90, '07:00:00', '21:00:00'
  ),
  (
    'm1000000-0000-0000-0000-000000000007',
    'c1000000-0000-0000-0000-000000000002',
    'South Indian Filter Coffee',
    'Traditional chicory-blend decoction frothed with boiling whole milk, served piping hot in a classic brass dabarah and tumbler.',
    ARRAY['Plantation Coffee', 'Chicory', 'Fresh Milk', 'Sugar'],
    25.00,
    'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&q=80&w=800',
    true, false, true, 3, 110, '07:00:00', '21:00:00'
  ),
  (
    'm1000000-0000-0000-0000-000000000008',
    'c1000000-0000-0000-0000-000000000002',
    'Thick Mango Lassi',
    'Whisked Alphonso mango pulp blended with thick creamy yogurt and topped with crushed pistachio slivers.',
    ARRAY['Mango Pulp', 'Curd', 'Pistachios', 'Cardamom'],
    45.00,
    'https://images.unsplash.com/photo-1528740561666-dc2479dc08ab?auto=format&fit=crop&q=80&w=800',
    true, true, true, 4, 210, '11:00:00', '21:00:00'
  ),
  (
    'm1000000-0000-0000-0000-000000000009',
    'c1000000-0000-0000-0000-000000000002',
    'Cold Coffee with Vanilla Scoop',
    'Thick blended espresso shake topped with a rich creamy vanilla ice cream scoop and cocoa dust.',
    ARRAY['Espresso', 'Chilled Milk', 'Vanilla Ice Cream', 'Chocolate Syrup'],
    60.00,
    'https://images.unsplash.com/photo-1517701604599-bb29b565090c?auto=format&fit=crop&q=80&w=800',
    true, false, true, 4, 260, '11:00:00', '21:00:00'
  ),

  -- Snacks
  (
    'm1000000-0000-0000-0000-000000000010',
    'c1000000-0000-0000-0000-000000000003',
    'Samosa Pav Duo',
    'Two crispy golden samosas packed with spiced potatoes and green peas, tucked in soft ladi pavs with dry garlic chutney.',
    ARRAY['Potatoes', 'Green Peas', 'Pav Bread', 'Garlic Chutney', 'Spices'],
    35.00,
    'https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&q=80&w=800',
    true, true, true, 2, 340, '07:00:00', '21:00:00'
  ),
  (
    'm1000000-0000-0000-0000-000000000011',
    'c1000000-0000-0000-0000-000000000003',
    'Double Cheese Spicy Maggi',
    'The campus legend: 2-minute noodles tossed with butter, sweet corn, capsicum, and smothered in molten mozzarella.',
    ARRAY['Maggi Noodles', 'Mozzarella Cheese', 'Sweet Corn', 'Capsicum', 'Butter'],
    50.00,
    'https://images.unsplash.com/photo-1612927601601-6638404737ce?auto=format&fit=crop&q=80&w=800',
    true, true, true, 5, 410, '07:00:00', '21:00:00'
  ),
  (
    'm1000000-0000-0000-0000-000000000012',
    'c1000000-0000-0000-0000-000000000003',
    'Paneer Kathi Roll',
    'Marinated charred cottage cheese cubes, bell peppers, and sliced onions wrapped in a flaky handmade paratha with spicy green chutney.',
    ARRAY['Paneer Tikka', 'Paratha', 'Onions', 'Bell Peppers', 'Mint Chutney'],
    70.00,
    'https://images.unsplash.com/photo-1626777553634-51e948ff5511?auto=format&fit=crop&q=80&w=800',
    true, false, true, 6, 440, '11:00:00', '21:00:00'
  ),
  (
    'm1000000-0000-0000-0000-000000000013',
    'c1000000-0000-0000-0000-000000000003',
    'Butter Pav Bhaji',
    'Mashed spiced vegetable curry cooked on a flat tawa with generous dollops of Amul butter, served with two toasted soft buns.',
    ARRAY['Potatoes', 'Tomatoes', 'Cauliflower', 'Amul Butter', 'Pav Bread'],
    75.00,
    'https://images.unsplash.com/photo-1606491956689-2ea866880c84?auto=format&fit=crop&q=80&w=800',
    true, true, true, 7, 520, '12:00:00', '21:00:00'
  ),

  -- Desserts
  (
    'm1000000-0000-0000-0000-000000000014',
    'c1000000-0000-0000-0000-000000000004',
    'Hot Gulab Jamun (2 Pcs)',
    'Soft, melt-in-the-mouth khoya dumplings soaked in hot saffron and cardamom sugar syrup.',
    ARRAY['Khoya', 'Saffron', 'Sugar', 'Cardamom', 'Rose Water'],
    35.00,
    'https://images.unsplash.com/photo-1589119908995-c6837fa14d48?auto=format&fit=crop&q=80&w=800',
    true, true, true, 2, 280, '11:00:00', '21:00:00'
  ),
  (
    'm1000000-0000-0000-0000-000000000015',
    'c1000000-0000-0000-0000-000000000004',
    'Kesar Rasmalai (2 Pcs)',
    'Flattened chenna discs poached in thickened saffron milk garnished with almond and pistachio flakes.',
    ARRAY['Cow Milk Chenna', 'Saffron Milk', 'Pistachios', 'Almonds'],
    55.00,
    'https://images.unsplash.com/photo-1621303837174-89787a7d4729?auto=format&fit=crop&q=80&w=800',
    true, false, true, 2, 240, '11:00:00', '21:00:00'
  )
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  price = EXCLUDED.price,
  available = EXCLUDED.available,
  serving_start = EXCLUDED.serving_start,
  serving_end = EXCLUDED.serving_end;

-- 3. SEED OPERATING HOURS FOR ALL DAYS (0=Sun to 6=Sat)
INSERT INTO public.operating_hours (day_of_week, service_type, start_time, end_time, active)
SELECT 
  d,
  s.service_type,
  s.start_time,
  s.end_time,
  true
FROM generate_series(0, 6) AS d
CROSS JOIN (
  VALUES
    ('BREAKFAST', '07:00:00'::TIME, '11:00:00'::TIME),
    ('LUNCH',     '11:00:00'::TIME, '16:00:00'::TIME),
    ('SNACKS',    '16:00:00'::TIME, '19:00:00'::TIME),
    ('DINNER',    '19:00:00'::TIME, '21:00:00'::TIME)
) AS s(service_type, start_time, end_time)
ON CONFLICT (day_of_week, service_type) DO UPDATE SET
  start_time = EXCLUDED.start_time,
  end_time = EXCLUDED.end_time,
  active = EXCLUDED.active;

-- 4. SEED INVENTORY ITEMS
INSERT INTO public.inventory (id, ingredient_name, category, quantity, unit, minimum_quantity)
VALUES
  ('i1000000-0000-0000-0000-000000000001', 'Basmati Rice', 'Grains', 150.00, 'kg', 30.00),
  ('i1000000-0000-0000-0000-000000000002', 'Cottage Cheese (Paneer)', 'Dairy', 38.00, 'kg', 10.00),
  ('i1000000-0000-0000-0000-000000000003', 'Whole Wheat Atta', 'Grains', 120.00, 'kg', 25.00),
  ('i1000000-0000-0000-0000-000000000004', 'Potatoes', 'Vegetables', 95.00, 'kg', 20.00),
  ('i1000000-0000-0000-0000-000000000005', 'Farm Fresh Milk', 'Dairy', 75.00, 'liters', 15.00),
  ('i1000000-0000-0000-0000-000000000006', 'Assam Tea Leaves', 'Dry Goods', 18.00, 'kg', 4.00),
  ('i1000000-0000-0000-0000-000000000007', 'Filter Coffee Powder', 'Dry Goods', 8.50, 'kg', 2.00),
  ('i1000000-0000-0000-0000-000000000008', 'Amul Butter', 'Dairy', 24.00, 'kg', 5.00),
  ('i1000000-0000-0000-0000-000000000009', 'Refined Sunflower Oil', 'Cooking Essentials', 45.00, 'liters', 12.00),
  ('i1000000-0000-0000-0000-000000000010', 'Pav Buns', 'Bakery', 240.00, 'pcs', 50.00),
  ('i1000000-0000-0000-0000-000000000011', 'Toor Dal', 'Pulses', 60.00, 'kg', 15.00),
  ('i1000000-0000-0000-0000-000000000012', 'Mozzarella Cheese', 'Dairy', 6.00, 'kg', 5.00) -- Triggering LOW inventory
ON CONFLICT (ingredient_name) DO UPDATE SET
  quantity = EXCLUDED.quantity,
  unit = EXCLUDED.unit,
  minimum_quantity = EXCLUDED.minimum_quantity;

-- 5. INITIAL CANTEEN SETTINGS
INSERT INTO public.canteen_settings (
  id, is_open, rush_mode, rush_pause_orders, current_service, average_wait_minutes, active_announcement, primary_counter
) VALUES (
  1, true, false, false, 'LUNCH', 8,
  'Hot Meals & Beverages available now. Display your token on screen when called at Counter 2!',
  'Counter 2'
) ON CONFLICT (id) DO UPDATE SET
  is_open = EXCLUDED.is_open,
  rush_mode = EXCLUDED.rush_mode,
  current_service = EXCLUDED.current_service,
  average_wait_minutes = EXCLUDED.average_wait_minutes,
  active_announcement = EXCLUDED.active_announcement;
