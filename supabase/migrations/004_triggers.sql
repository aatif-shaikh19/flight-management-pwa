-- Trigger function: DB-level enforcement of 2-hour cancellation rule
-- This fires even if someone bypasses the RPC and does a raw UPDATE
CREATE OR REPLACE FUNCTION check_cancellation_window()
RETURNS TRIGGER AS $$
DECLARE
  v_departs_at TIMESTAMPTZ;
BEGIN
  -- Only act when status changes TO 'cancelled'
  IF NEW.status = 'cancelled' AND OLD.status <> 'cancelled' THEN
    SELECT f.departs_at INTO v_departs_at
    FROM flights f
    WHERE f.id = NEW.flight_id;

    IF v_departs_at - NOW() < INTERVAL '2 hours' THEN
      RAISE EXCEPTION 'Cannot cancel a booking within 2 hours of departure';
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER enforce_cancellation_window
BEFORE UPDATE ON bookings
FOR EACH ROW
EXECUTE FUNCTION check_cancellation_window();
