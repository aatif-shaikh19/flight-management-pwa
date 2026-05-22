'use server'

import { createClient } from '@/lib/supabase/server'
import { PassengerSchema } from '@/lib/validations/passenger'

export type BookingActionResult =
  | { success: true; pnrCode: string }
  | { success: false; error: string; fieldErrors?: Record<string, string[]> }

export async function createBooking(
  flightId: string,
  seatId: string,
  totalPrice: number,
  formData: {
    fullName: string
    passportNo: string
    nationality: string
    dob: string
  }
): Promise<BookingActionResult> {
  // Step 1: Validate all form fields with Zod
  const validation = PassengerSchema.safeParse(formData)
  if (!validation.success) {
    return {
      success: false,
      error: 'Please fix the form errors below.',
      fieldErrors: validation.error.flatten().fieldErrors as Record<string, string[]>,
    }
  }

  // Step 2: Get authenticated user from server session
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    return { success: false, error: 'You must be logged in to book a flight.' }
  }

  // Step 3: Call reserve_seat RPC (atomic — prevents double booking)
  const { data, error: rpcError } = await (supabase as any).rpc('reserve_seat', {
    p_flight_id:   flightId,
    p_seat_id:     seatId,
    p_user_id:     user.id,
    p_full_name:   validation.data.fullName,
    p_passport_no: validation.data.passportNo,
    p_nationality: validation.data.nationality,
    p_dob:         validation.data.dob,
    p_total_price: totalPrice,
  })

  if (rpcError) {
    // Parse the RPC exception message for user-friendly errors
    const msg = rpcError.message ?? ''

    if (msg.includes('seat_unavailable')) {
      return {
        success: false,
        error: 'This seat was just taken by another passenger. Please go back and select a different seat.',
      }
    }
    if (msg.includes('seat_not_found')) {
      return { success: false, error: 'Seat not found. Please try again.' }
    }

    console.error('reserve_seat RPC error:', rpcError)
    return { success: false, error: 'Booking failed. Please try again.' }
  }

  const result = data as { booking_id: string; pnr_code: string }
  return { success: true, pnrCode: result.pnr_code }
}
