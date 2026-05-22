-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- FLIGHTS: root entity
CREATE TABLE flights (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  flight_no     VARCHAR(10) NOT NULL UNIQUE,
  origin        VARCHAR(3) NOT NULL,
  destination   VARCHAR(3) NOT NULL,
  departs_at    TIMESTAMPTZ NOT NULL,
  arrives_at    TIMESTAMPTZ NOT NULL,
  aircraft_type VARCHAR(50),
  status        VARCHAR(20) DEFAULT 'scheduled'
                CHECK (status IN ('scheduled', 'delayed', 'cancelled')),
  base_price    NUMERIC(10,2) NOT NULL CHECK (base_price > 0),
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- SEATS: one seat map per flight
CREATE TABLE seats (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  flight_id     UUID NOT NULL REFERENCES flights(id) ON DELETE CASCADE,
  seat_number   VARCHAR(5) NOT NULL,
  class         VARCHAR(10) NOT NULL
                CHECK (class IN ('economy', 'business', 'first')),
  is_available  BOOLEAN DEFAULT TRUE NOT NULL,
  extra_fee     NUMERIC(10,2) DEFAULT 0 CHECK (extra_fee >= 0),
  UNIQUE(flight_id, seat_number)
);

-- BOOKINGS: links user + flight + seat
CREATE TABLE bookings (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  flight_id     UUID NOT NULL REFERENCES flights(id),
  seat_id       UUID NOT NULL REFERENCES seats(id),
  status        VARCHAR(20) DEFAULT 'confirmed'
                CHECK (status IN ('confirmed', 'rescheduled', 'cancelled')),
  booked_at     TIMESTAMPTZ DEFAULT NOW(),
  total_price   NUMERIC(10,2) NOT NULL CHECK (total_price > 0),
  pnr_code      VARCHAR(10) UNIQUE NOT NULL,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- PASSENGERS: traveller details per booking
CREATE TABLE passengers (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id    UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  full_name     TEXT NOT NULL,
  passport_no   TEXT NOT NULL,
  nationality   VARCHAR(100) NOT NULL,
  dob           DATE NOT NULL,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- RESCHEDULES: audit log of booking changes
CREATE TABLE reschedules (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id      UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  old_flight_id   UUID NOT NULL REFERENCES flights(id),
  new_flight_id   UUID NOT NULL REFERENCES flights(id),
  requested_at    TIMESTAMPTZ DEFAULT NOW(),
  fee_charged     NUMERIC(10,2) DEFAULT 0 CHECK (fee_charged >= 0)
);
