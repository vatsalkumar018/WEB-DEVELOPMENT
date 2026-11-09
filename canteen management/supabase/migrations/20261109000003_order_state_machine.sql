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
