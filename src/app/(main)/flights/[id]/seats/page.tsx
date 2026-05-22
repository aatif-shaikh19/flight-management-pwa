import { createClient } from '@/lib/supabase/server'
import { SeatMap } from '@/components/seats/SeatMap'
import { FlightSummaryBar } from '@/components/seats/FlightSummaryBar'
import { notFound, redirect } from 'next/navigation'

export const dynamic = 'force-dynamic'

type SeatsPageProps = {
  params: Promise<{ id: string }>
}

export default async function SeatsPage({ params }: SeatsPageProps) {
  const { id } = await params
  const supabase = await createClient()

  // Get current user
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect(`/login?redirectTo=/flights/${id}/seats`)
  }

  // Fetch flight
  const { data: flightData } = await supabase
    .from('flights')
    .select('*')
    .eq('id', id)
    .single()

  const flight = flightData as any

  if (!flight) notFound()

  // Fetch all seats for this flight
  const { data: seats } = await supabase
    .from('seats')
    .select('*')
    .eq('flight_id', id)
    .order('seat_number', { ascending: true })

  if (!seats) notFound()

  // Fetch seat IDs already booked by this user on this flight
  // (so we can mark them amber — "your seat")
  const { data: userBookingsData } = await supabase
    .from('bookings')
    .select('seat_id')
    .eq('user_id', user.id)
    .eq('flight_id', id)
    .eq('status', 'confirmed')

  const userBookings = userBookingsData as any[] | null

  const bookedSeatIds = userBookings?.map((b) => b.seat_id) ?? []

  return (
    <main className="max-w-2xl mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
        <a href="/" className="hover:text-blue-600">Search</a>
        <span>›</span>
        <a href={`/flights?origin=${flight.origin}&destination=${flight.destination}&date=${flight.departs_at.split('T')[0]}&passengers=1`}
          className="hover:text-blue-600">
          Results
        </a>
        <span>›</span>
        <span>Select Seat</span>
      </div>

      <h1 className="text-2xl font-bold text-gray-900 mb-2">Choose Your Seat</h1>
      <p className="text-sm text-gray-500 mb-6">
        Tap a seat to select it. Prices shown include seat fee.
      </p>

      {/* Flight summary */}
      <FlightSummaryBar flight={flight} />

      {/* Seat map */}
      <SeatMap
        flight={flight}
        initialSeats={seats}
        bookedSeatIds={bookedSeatIds}
      />
    </main>
  )
}
