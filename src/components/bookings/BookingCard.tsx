'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { cancelBooking } from '@/app/bookings/actions'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { RescheduleDialog } from './RescheduleDialog'
import { formatTime, formatDate, formatPrice, getFlightDuration, getAirportName } from '@/lib/utils'
import { cn } from '@/lib/utils'
import { Plane, Clock, Tag, MapPin, RefreshCw, XCircle } from 'lucide-react'
import type { Database } from '@/types/supabase'

type Flight    = Database['public']['Tables']['flights']['Row']
type Seat      = Database['public']['Tables']['seats']['Row']
type Passenger = Database['public']['Tables']['passengers']['Row']

type BookingWithRelations = Database['public']['Tables']['bookings']['Row'] & {
  flights:    Flight
  seats:      Seat
  passengers: Passenger[]
}

type BookingCardProps = {
  booking: BookingWithRelations
}

const STATUS_STYLES: Record<string, string> = {
  confirmed:   'bg-emerald-50 text-emerald-700 border-emerald-200',
  rescheduled: 'bg-blue-50 text-blue-700 border-blue-200',
  cancelled:   'bg-red-50 text-red-400 border-red-200',
}

export function BookingCard({ booking }: BookingCardProps) {
  const router = useRouter()
  const [cancelOpen,     setCancelOpen]     = useState(false)
  const [rescheduleOpen, setRescheduleOpen] = useState(false)
  const [cancelling,     setCancelling]     = useState(false)
  const [error,          setError]          = useState<string | null>(null)

  // Optimistic UI: local status overrides server status while processing
  const [localStatus, setLocalStatus] = useState(booking.status)

  // Sync local status when the server data refreshes
  useEffect(() => {
    setLocalStatus(booking.status)
  }, [booking.status])

  const flight    = booking.flights
  const seat      = booking.seats
  const passenger = booking.passengers?.[0]
  const duration  = getFlightDuration(flight.departs_at, flight.arrives_at)
  const isCancelled = localStatus === 'cancelled'

  async function handleCancel() {
    setCancelling(true)
    setError(null)

    // Optimistic update — UI changes immediately
    setLocalStatus('cancelled')

    const result = await cancelBooking(booking.id)

    setCancelling(false)
    setCancelOpen(false)

    if (!result.success) {
      // Revert optimistic update on failure
      setLocalStatus(booking.status)
      setError(result.error)
      return
    }

    router.refresh()
  }

  function handleRescheduleSuccess() {
    setRescheduleOpen(false)
    router.refresh()
  }

  return (
    <>
      <div className={cn(
        'bg-white border rounded-2xl overflow-hidden transition-opacity',
        isCancelled ? 'opacity-60' : 'border-gray-200'
      )}>
        {/* Card header: PNR + status */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <div>
            <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">PNR</p>
            <p className="font-black text-lg text-gray-900 tracking-widest">
              {booking.pnr_code}
            </p>
          </div>
          <span className={cn(
            'text-xs font-semibold px-3 py-1 rounded-full border capitalize',
            STATUS_STYLES[localStatus ?? 'confirmed'] ?? STATUS_STYLES['confirmed']
          )}>
            {localStatus}
          </span>
        </div>

        {/* Flight info */}
        <div className="px-5 py-4">
          <div className="flex items-center gap-2 mb-3">
            <Plane className="w-3.5 h-3.5 text-blue-600" />
            <span className="font-bold text-sm text-gray-900">{flight.flight_no}</span>
            {flight.aircraft_type && (
              <span className="text-xs text-gray-400">{flight.aircraft_type}</span>
            )}
          </div>

          <div className="flex items-center gap-3 mb-3">
            <div className="text-center">
              <p className="text-xl font-bold text-gray-900">
                {formatTime(flight.departs_at)}
              </p>
              <p className="text-xs text-gray-500">{getAirportName(flight.origin)}</p>
              <p className="text-xs font-bold text-gray-700">{flight.origin}</p>
            </div>

            <div className="flex-1 flex flex-col items-center text-gray-400 text-xs gap-1">
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />{duration}
              </span>
              <div className="flex items-center gap-1 w-full">
                <div className="flex-1 h-px bg-gray-200" />
                <Plane className="w-2.5 h-2.5 rotate-90" />
                <div className="flex-1 h-px bg-gray-200" />
              </div>
              <span>{formatDate(flight.departs_at)}</span>
            </div>

            <div className="text-center">
              <p className="text-xl font-bold text-gray-900">
                {formatTime(flight.arrives_at)}
              </p>
              <p className="text-xs text-gray-500">{getAirportName(flight.destination)}</p>
              <p className="text-xs font-bold text-gray-700">{flight.destination}</p>
            </div>
          </div>

          {/* Seat + price + passenger row */}
          <div className="flex flex-wrap gap-3 text-xs text-gray-500 pt-3 border-t border-gray-100">
            <span className="flex items-center gap-1">
              <MapPin className="w-3 h-3" />
              Seat {seat.seat_number}
              <span className="capitalize ml-0.5">({seat.class})</span>
            </span>
            <span className="flex items-center gap-1">
              <Tag className="w-3 h-3" />
              {formatPrice(booking.total_price)}
            </span>
            {passenger && (
              <span className="text-gray-400">{passenger.full_name}</span>
            )}
          </div>
        </div>

        {/* Error message */}
        {error && (
          <div className="mx-5 mb-3 text-xs text-red-500 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
            {error}
          </div>
        )}

        {/* Actions — only for confirmed/rescheduled */}
        {!isCancelled && (
          <div className="px-5 py-3 border-t border-gray-100 bg-gray-50 flex gap-2">
            <button
              onClick={() => setRescheduleOpen(true)}
              className="flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-700 bg-white border border-blue-200 hover:border-blue-300 px-3 py-2 rounded-lg transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Reschedule
            </button>
            <button
              onClick={() => setCancelOpen(true)}
              className="flex items-center gap-1.5 text-xs font-semibold text-red-500 hover:text-red-600 bg-white border border-red-200 hover:border-red-300 px-3 py-2 rounded-lg transition-colors"
            >
              <XCircle className="w-3.5 h-3.5" />
              Cancel
            </button>
          </div>
        )}
      </div>

      {/* Cancel confirmation dialog */}
      <ConfirmDialog
        isOpen={cancelOpen}
        variant="danger"
        title="Cancel Booking?"
        description={`This will cancel your booking for ${flight.flight_no} on ${formatDate(flight.departs_at)}. This action cannot be undone.`}
        confirmLabel="Yes, Cancel Booking"
        loading={cancelling}
        onConfirm={handleCancel}
        onCancel={() => { setCancelOpen(false); setError(null) }}
      />

      {/* Reschedule dialog */}
      <RescheduleDialog
        isOpen={rescheduleOpen}
        bookingId={booking.id}
        currentFlightId={flight.id}
        origin={flight.origin}
        destination={flight.destination}
        currentPrice={flight.base_price}
        onClose={() => setRescheduleOpen(false)}
        onSuccess={handleRescheduleSuccess}
      />
    </>
  )
}
