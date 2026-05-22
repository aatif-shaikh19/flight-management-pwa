-- Enable RLS on all tables
ALTER TABLE flights     ENABLE ROW LEVEL SECURITY;
ALTER TABLE seats       ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings    ENABLE ROW LEVEL SECURITY;
ALTER TABLE passengers  ENABLE ROW LEVEL SECURITY;
ALTER TABLE reschedules ENABLE ROW LEVEL SECURITY;

-- FLIGHTS: public read (anyone can search flights)
CREATE POLICY "flights_public_read"
ON flights FOR SELECT USING (true);

-- SEATS: public read (need to see availability without logging in)
CREATE POLICY "seats_public_read"
ON seats FOR SELECT USING (true);

-- BOOKINGS: users manage only their own
CREATE POLICY "bookings_user_select"
ON bookings FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "bookings_user_insert"
ON bookings FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "bookings_user_update"
ON bookings FOR UPDATE
USING (auth.uid() = user_id);

-- PASSENGERS: access via booking ownership
CREATE POLICY "passengers_user_select"
ON passengers FOR SELECT
USING (
  booking_id IN (
    SELECT id FROM bookings WHERE user_id = auth.uid()
  )
);

CREATE POLICY "passengers_user_insert"
ON passengers FOR INSERT
WITH CHECK (
  booking_id IN (
    SELECT id FROM bookings WHERE user_id = auth.uid()
  )
);

-- RESCHEDULES: access via booking ownership
CREATE POLICY "reschedules_user_select"
ON reschedules FOR SELECT
USING (
  booking_id IN (
    SELECT id FROM bookings WHERE user_id = auth.uid()
  )
);

CREATE POLICY "reschedules_user_insert"
ON reschedules FOR INSERT
WITH CHECK (
  booking_id IN (
    SELECT id FROM bookings WHERE user_id = auth.uid()
  )
);
