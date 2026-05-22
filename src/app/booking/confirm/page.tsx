import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { formatTime, formatDate, formatPrice, getAirportName, getFlightDuration } from '@/lib/utils'
import { CheckCircle, Plane, MapPin, Clock, User, Tag } from 'lucide-react'

type ConfirmPageProps = {
  searchParams: Promise<{ pnr?: string }>
}

export default async function ConfirmPage({ searchParams }: ConfirmPageProps) {
  const { pnr } = await searchParams
  if (!pnr) redirect('/')

  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Fetch booking with all related data
  const { data: bookingData } = await supabase
    .from('bookings')
    .select(`
      *,
      flights (*),
      seats (*),
      passengers (*)
    `)
    .eq('pnr_code', pnr)
    .eq('user_id', user.id)
    .single()

  const booking = bookingData as any

  if (!booking) redirect('/')

  const flight    = booking.flights as unknown as ReturnType<typeof Object.assign>
  const seat      = booking.seats as unknown as ReturnType<typeof Object.assign>
  const passenger = Array.isArray(booking.passengers)
    ? booking.passengers[0]
    : booking.passengers

  const duration = getFlightDuration(flight.departs_at, flight.arrives_at)

  return (
    <main className="max-w-lg mx-auto px-4 py-8">
      {/* Success header */}
      <div className="text-center mb-8">
        <div className="flex justify-center mb-3">
          <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center">
            <CheckCircle className="w-8 h-8 text-emerald-500" />
          </div>
        </div>
        <h1 className="text-2xl font-bold text-gray-900">Booking Confirmed!</h1>
        <p className="text-gray-500 text-sm mt-1">
          Your booking is confirmed. Save your PNR code.
        </p>
      </div>

      {/* PNR code — the most prominent thing */}
      <div className="bg-blue-600 text-white rounded-2xl p-6 text-center mb-6">
        <p className="text-blue-200 text-xs font-semibold uppercase tracking-widest mb-2">
          PNR Code
        </p>
        <p className="text-4xl font-black tracking-widest">{booking.pnr_code}</p>
        <p className="text-blue-200 text-xs mt-2">Show this at check-in</p>
      </div>

      {/* Flight details */}
      <div className="bg-white border border-gray-200 rounded-2xl p-5 mb-4">
        <div className="flex items-center gap-2 mb-4">
          <Plane className="w-4 h-4 text-blue-600" />
          <span className="font-bold text-sm text-gray-900">{flight.flight_no}</span>
          <span className="text-xs text-gray-400">{flight.aircraft_type}</span>
        </div>

        <div className="flex items-center gap-3 mb-4">
          <div className="text-center flex-1">
            <p className="text-xl font-bold">{formatTime(flight.departs_at)}</p>
            <p className="text-xs text-gray-500 mt-0.5">{getAirportName(flight.origin)}</p>
            <p className="text-xs font-bold text-gray-700">{flight.origin}</p>
          </div>
          <div className="flex flex-col items-center text-gray-400 text-xs gap-1">
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />{duration}
            </span>
            <div className="flex items-center gap-1 w-16">
              <div className="flex-1 h-px bg-gray-200" />
              <Plane className="w-2.5 h-2.5 rotate-90" />
              <div className="flex-1 h-px bg-gray-200" />
            </div>
          </div>
          <div className="text-center flex-1">
            <p className="text-xl font-bold">{formatTime(flight.arrives_at)}</p>
            <p className="text-xs text-gray-500 mt-0.5">{getAirportName(flight.destination)}</p>
            <p className="text-xs font-bold text-gray-700">{flight.destination}</p>
          </div>
        </div>

        <div className="text-xs text-gray-400 text-center border-t border-gray-100 pt-3">
          {formatDate(flight.departs_at)}
        </div>
      </div>

      {/* Seat + passenger + price */}
      <div className="bg-white border border-gray-200 rounded-2xl divide-y divide-gray-100 mb-6">
        <div className="flex items-center justify-between px-5 py-4">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <MapPin className="w-4 h-4" /> Seat
          </div>
          <div className="text-right">
            <span className="font-bold text-gray-900">{seat.seat_number}</span>
            <span className="ml-2 text-xs capitalize text-gray-400">{seat.class}</span>
          </div>
        </div>

        {passenger && (
          <div className="flex items-center justify-between px-5 py-4">
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <User className="w-4 h-4" /> Passenger
            </div>
            <span className="font-semibold text-gray-900">{passenger.full_name}</span>
          </div>
        )}

        <div className="flex items-center justify-between px-5 py-4">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Tag className="w-4 h-4" /> Total Paid
          </div>
          <span className="font-bold text-blue-600 text-lg">
            {formatPrice(booking.total_price)}
          </span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-col gap-3">
        <a
          href="/bookings"
          className="w-full text-center bg-blue-600 hover:bg-blue-700 text-white font-semibold px-5 py-3 rounded-xl transition-colors text-sm"
        >
          View My Bookings
        </a>
        <a
          href="/"
          className="w-full text-center border border-gray-200 text-gray-600 hover:bg-gray-50 font-medium px-5 py-3 rounded-xl transition-colors text-sm"
        >
          Book Another Flight
        </a>
      </div>
    </main>
  )
}
