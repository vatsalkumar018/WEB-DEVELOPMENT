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
