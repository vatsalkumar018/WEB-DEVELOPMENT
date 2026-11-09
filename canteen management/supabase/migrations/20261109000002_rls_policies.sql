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
