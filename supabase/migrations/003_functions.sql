-- Helper: generate a unique 6-char PNR code (no I, O, 0, 1 — visually ambiguous)
CREATE OR REPLACE FUNCTION generate_pnr()
RETURNS TEXT AS $$
DECLARE
  chars  TEXT := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  result TEXT := '';
  i      INT;
BEGIN
  FOR i IN 1..6 LOOP
    result := result || substr(chars, floor(random() * length(chars) + 1)::int, 1);
  END LOOP;
  RETURN result;
END;
$$ LANGUAGE plpgsql;

-- RPC: reserve_seat
-- Atomically locks seat, creates booking + passenger, returns pnr_code
-- SECURITY DEFINER: runs as function owner so it can UPDATE seats despite RLS
CREATE OR REPLACE FUNCTION reserve_seat(
  p_flight_id   UUID,
  p_seat_id     UUID,
  p_user_id     UUID,
  p_full_name   TEXT,
  p_passport_no TEXT,
  p_nationality TEXT,
  p_dob         DATE,
  p_total_price NUMERIC
)
RETURNS JSON AS $$
DECLARE
  v_booking_id  UUID;
  v_pnr         TEXT;
  v_seat_avail  BOOLEAN;
BEGIN
  -- Lock the seat row so concurrent transactions must wait
  SELECT is_available INTO v_seat_avail
  FROM seats
  WHERE id = p_seat_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'seat_not_found: Seat does not exist';
  END IF;

  IF NOT v_seat_avail THEN
    RAISE EXCEPTION 'seat_unavailable: Seat is no longer available';
  END IF;

  -- Mark seat as taken
  UPDATE seats SET is_available = FALSE WHERE id = p_seat_id;

  -- Generate a unique PNR
  LOOP
    v_pnr := generate_pnr();
    EXIT WHEN NOT EXISTS (SELECT 1 FROM bookings WHERE pnr_code = v_pnr);
  END LOOP;

  -- Create booking
  INSERT INTO bookings (user_id, flight_id, seat_id, total_price, pnr_code)
  VALUES (p_user_id, p_flight_id, p_seat_id, p_total_price, v_pnr)
  RETURNING id INTO v_booking_id;

  -- Create passenger record
  INSERT INTO passengers (booking_id, full_name, passport_no, nationality, dob)
  VALUES (v_booking_id, p_full_name, p_passport_no, p_nationality, p_dob);

  RETURN json_build_object(
    'booking_id', v_booking_id,
    'pnr_code',   v_pnr
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- RPC: cancel_booking
-- Atomically validates ownership, checks 2hr window, cancels + frees seat
CREATE OR REPLACE FUNCTION cancel_booking(
  p_booking_id UUID,
  p_user_id    UUID
)
RETURNS VOID AS $$
DECLARE
  v_seat_id    UUID;
  v_departs_at TIMESTAMPTZ;
  v_status     TEXT;
BEGIN
  SELECT b.seat_id, f.departs_at, b.status
  INTO v_seat_id, v_departs_at, v_status
  FROM bookings b
  JOIN flights f ON b.flight_id = f.id
  WHERE b.id = p_booking_id AND b.user_id = p_user_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'not_found: Booking not found or access denied';
  END IF;

  IF v_status = 'cancelled' THEN
    RAISE EXCEPTION 'already_cancelled: Booking is already cancelled';
  END IF;

  IF v_departs_at - NOW() < INTERVAL '2 hours' THEN
    RAISE EXCEPTION 'cancellation_window: Cannot cancel within 2 hours of departure';
  END IF;

  UPDATE bookings SET status = 'cancelled' WHERE id = p_booking_id;
  UPDATE seats    SET is_available = TRUE   WHERE id = v_seat_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
