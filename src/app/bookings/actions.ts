'use server'

import { createClient } from '@/lib/supabase/server'

export type MutationResult =
  | { success: true }
  | { success: false; error: string }

// Cancel a booking via the cancel_booking RPC
export async function cancelBooking(bookingId: string): Promise<MutationResult> {
  const supabase = await createClient()

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return { success: false, error: 'You must be logged in.' }
  }

  const { error } = await (supabase as any).rpc('cancel_booking', {
    p_booking_id: bookingId,
    p_user_id:    user.id,
  })

  if (error) {
    const msg = error.message ?? ''
    if (msg.includes('cancellation_window') || msg.includes('2 hours')) {
      return {
        success: false,
        error: 'Cancellations are not allowed within 2 hours of departure.',
      }
    }
    if (msg.includes('already_cancelled')) {
      return { success: false, error: 'This booking is already cancelled.' }
    }
    if (msg.includes('not_found')) {
      return { success: false, error: 'Booking not found.' }
    }
    console.error('cancel_booking RPC error:', error)
    return { success: false, error: 'Cancellation failed. Please try again.' }
  }

  return { success: true }
}

// Reschedule a booking to a new flight on the same route
export async function rescheduleBooking(
  bookingId:   string,
  newFlightId: string,
  feeCharged:  number
): Promise<MutationResult> {
  const supabase = await createClient()

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return { success: false, error: 'You must be logged in.' }
  }

  // Verify booking belongs to this user and get current flight
  const { data: bookingData, error: fetchError } = await supabase
    .from('bookings')
    .select('id, flight_id, status, flights(base_price)')
    .eq('id', bookingId)
    .eq('user_id', user.id)
    .single()

  const booking = bookingData as any

  if (fetchError || !booking) {
    return { success: false, error: 'Booking not found.' }
  }

  if (booking.status === 'cancelled') {
    return { success: false, error: 'Cannot reschedule a cancelled booking.' }
  }

  // Insert reschedule record + update booking in a single transaction-like sequence
  const { error: rescheduleError } = await supabase
    .from('reschedules')
    .insert({
      booking_id:    bookingId,
      old_flight_id: booking.flight_id,
      new_flight_id: newFlightId,
      fee_charged:   feeCharged,
    } as any)

  if (rescheduleError) {
    console.error('reschedule insert error:', rescheduleError)
    return { success: false, error: 'Reschedule failed. Please try again.' }
  }

  const { error: updateError } = await (supabase as any)
    .from('bookings')
    .update({
      flight_id: newFlightId,
      status:    'rescheduled',
    })
    .eq('id', bookingId)
    .eq('user_id', user.id)

  if (updateError) {
    console.error('booking update error:', updateError)
    return { success: false, error: 'Reschedule failed. Please try again.' }
  }

  return { success: true }
}
