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
