-- Speed up flight searches by route
CREATE INDEX idx_flights_route    ON flights(origin, destination);
CREATE INDEX idx_flights_departs  ON flights(departs_at);

-- Speed up seat lookups per flight
CREATE INDEX idx_seats_flight     ON seats(flight_id);
CREATE INDEX idx_seats_available  ON seats(flight_id, is_available);

-- Speed up booking lookups per user
CREATE INDEX idx_bookings_user    ON bookings(user_id);
CREATE INDEX idx_bookings_pnr     ON bookings(pnr_code);

-- Speed up passenger lookups
CREATE INDEX idx_passengers_booking ON passengers(booking_id);
