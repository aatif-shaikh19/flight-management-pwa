-- ============================================================
-- SEED DATA — 8 flights across 4 routes, full seat maps
-- Test user is created via Supabase Auth dashboard manually
-- ============================================================

-- Clear existing data (safe to re-run)
TRUNCATE TABLE reschedules, passengers, bookings, seats, flights RESTART IDENTITY CASCADE;

-- ============================================================
-- FLIGHTS (8 total, 4 routes, 2 flights per route)
-- Dates set ~30 days from now so cancellation tests work
-- ============================================================

INSERT INTO flights (id, flight_no, origin, destination, departs_at, arrives_at, aircraft_type, status, base_price) VALUES

-- Route 1: BOM → DEL (Mumbai → Delhi)
('11111111-0000-0000-0000-000000000001', 'AI-201', 'BOM', 'DEL',
  NOW() + INTERVAL '3 days 6 hours',
  NOW() + INTERVAL '3 days 8 hours 15 minutes',
  'Airbus A320', 'scheduled', 4500.00),

('11111111-0000-0000-0000-000000000002', 'AI-202', 'BOM', 'DEL',
  NOW() + INTERVAL '3 days 14 hours',
  NOW() + INTERVAL '3 days 16 hours 15 minutes',
  'Boeing 737', 'scheduled', 5200.00),

-- Route 2: DEL → BLR (Delhi → Bangalore)
('11111111-0000-0000-0000-000000000003', '6E-301', 'DEL', 'BLR',
  NOW() + INTERVAL '4 days 7 hours',
  NOW() + INTERVAL '4 days 9 hours 30 minutes',
  'Airbus A320neo', 'scheduled', 3800.00),

('11111111-0000-0000-0000-000000000004', '6E-302', 'DEL', 'BLR',
  NOW() + INTERVAL '4 days 16 hours',
  NOW() + INTERVAL '4 days 18 hours 30 minutes',
  'Boeing 737 MAX', 'scheduled', 4100.00),

-- Route 3: BLR → MAA (Bangalore → Chennai)
('11111111-0000-0000-0000-000000000005', 'SG-401', 'BLR', 'MAA',
  NOW() + INTERVAL '5 days 8 hours',
  NOW() + INTERVAL '5 days 9 hours',
  'Bombardier Q400', 'scheduled', 2200.00),

('11111111-0000-0000-0000-000000000006', 'SG-402', 'BLR', 'MAA',
  NOW() + INTERVAL '5 days 15 hours',
  NOW() + INTERVAL '5 days 16 hours',
  'ATR 72', 'scheduled', 2500.00),

-- Route 4: MAA → BOM (Chennai → Mumbai)
('11111111-0000-0000-0000-000000000007', 'UK-501', 'MAA', 'BOM',
  NOW() + INTERVAL '6 days 9 hours',
  NOW() + INTERVAL '6 days 11 hours 15 minutes',
  'Airbus A319', 'scheduled', 3500.00),

('11111111-0000-0000-0000-000000000008', 'UK-502', 'MAA', 'BOM',
  NOW() + INTERVAL '6 days 17 hours',
  NOW() + INTERVAL '6 days 19 hours 15 minutes',
  'Boeing 737', 'scheduled', 3900.00);

-- ============================================================
-- SEATS — generate seat maps for all 8 flights
-- First class: rows 1-2 (A,C,D = 3 seats/row = 6 seats)
-- Business:    rows 3-6 (A,B,E,F = 4 seats/row = 16 seats)
-- Economy:     rows 7-18 (A,B,C,D,E,F = 6 seats/row = 72 seats)
-- Total: 94 seats per flight
-- ============================================================

DO $$
DECLARE
  flight_ids UUID[] := ARRAY[
    '11111111-0000-0000-0000-000000000001'::UUID,
    '11111111-0000-0000-0000-000000000002'::UUID,
    '11111111-0000-0000-0000-000000000003'::UUID,
    '11111111-0000-0000-0000-000000000004'::UUID,
    '11111111-0000-0000-0000-000000000005'::UUID,
    '11111111-0000-0000-0000-000000000006'::UUID,
    '11111111-0000-0000-0000-000000000007'::UUID,
    '11111111-0000-0000-0000-000000000008'::UUID
  ];
  fid      UUID;
  row_num  INT;
  col      TEXT;
BEGIN
  FOREACH fid IN ARRAY flight_ids LOOP

    -- First Class: rows 1-2, columns A C D
    FOR row_num IN 1..2 LOOP
      FOREACH col IN ARRAY ARRAY['A','C','D'] LOOP
        INSERT INTO seats (flight_id, seat_number, class, is_available, extra_fee)
        VALUES (fid, row_num::TEXT || col, 'first', TRUE, 3000.00);
      END LOOP;
    END LOOP;

    -- Business: rows 3-6, columns A B E F
    FOR row_num IN 3..6 LOOP
      FOREACH col IN ARRAY ARRAY['A','B','E','F'] LOOP
        INSERT INTO seats (flight_id, seat_number, class, is_available, extra_fee)
        VALUES (fid, row_num::TEXT || col, 'business', TRUE, 1500.00);
      END LOOP;
    END LOOP;

    -- Economy: rows 7-18, columns A B C D E F
    FOR row_num IN 7..18 LOOP
      FOREACH col IN ARRAY ARRAY['A','B','C','D','E','F'] LOOP
        INSERT INTO seats (flight_id, seat_number, class, is_available, extra_fee)
        VALUES (fid, row_num::TEXT || col, 'economy', TRUE, 0.00);
      END LOOP;
    END LOOP;

  END LOOP;
END $$;

-- Mark a few seats as already occupied (for visual testing)
UPDATE seats SET is_available = FALSE
WHERE flight_id = '11111111-0000-0000-0000-000000000001'
  AND seat_number IN ('7A', '7B', '8C', '3A', '1A');

UPDATE seats SET is_available = FALSE
WHERE flight_id = '11111111-0000-0000-0000-000000000003'
  AND seat_number IN ('7D', '9E', '10F', '4B');
