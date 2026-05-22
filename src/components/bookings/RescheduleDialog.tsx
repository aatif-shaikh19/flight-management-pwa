'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { rescheduleBooking } from '@/app/bookings/actions'
import { formatTime, formatDate, formatPrice, getFlightDuration, getAirportName } from '@/lib/utils'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { X, Plane, Clock } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Database } from '@/types/supabase'

type Flight = Database['public']['Tables']['flights']['Row']

type RescheduleDialogProps = {
  isOpen:          boolean
  bookingId:       string
  currentFlightId: string
  origin:          string
  destination:     string
  currentPrice:    number
  onClose:         () => void
  onSuccess:       () => void
}

export function RescheduleDialog({
  isOpen,
  bookingId,
  currentFlightId,
  origin,
  destination,
  currentPrice,
  onClose,
  onSuccess,
}: RescheduleDialogProps) {
  const [flights,       setFlights]       = useState<Flight[]>([])
  const [selectedNew,   setSelectedNew]   = useState<Flight | null>(null)
  const [loading,       setLoading]       = useState(false)
  const [fetching,      setFetching]      = useState(false)
  const [error,         setError]         = useState<string | null>(null)
  const [confirmOpen,   setConfirmOpen]   = useState(false)

  useEffect(() => {
    if (!isOpen) return
    setSelectedNew(null)
    setError(null)

    async function fetchAlternates() {
      setFetching(true)
      const supabase = createClient()

      const { data } = await supabase
        .from('flights')
        .select('*')
        .eq('origin', origin)
        .eq('destination', destination)
        .eq('status', 'scheduled')
        .neq('id', currentFlightId)
        .gte('departs_at', new Date().toISOString())
        .order('departs_at', { ascending: true })

      setFlights(data ?? [])
      setFetching(false)
    }

    fetchAlternates()
  }, [isOpen, origin, destination, currentFlightId])

  const fee = selectedNew
    ? Math.max(0, selectedNew.base_price - currentPrice)
    : 0

  async function handleConfirmReschedule() {
    if (!selectedNew) return
    setLoading(true)
    setError(null)

    const result = await rescheduleBooking(bookingId, selectedNew.id, fee)

    setLoading(false)
    setConfirmOpen(false)

    if (!result.success) {
      setError(result.error)
      return
    }

    onSuccess()
  }

  if (!isOpen) return null

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 flex items-end sm:items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      >
        <div
          className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[80vh] flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <h2 className="font-bold text-gray-900">Choose New Flight</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <X className="w-5 h-5" />
            </button>
          </div>

          <p className="px-6 py-3 text-sm text-gray-500">
            {getAirportName(origin)} → {getAirportName(destination)}
          </p>

          {/* Flight list */}
          <div className="flex-1 overflow-y-auto px-6 pb-4 flex flex-col gap-3">
            {fetching ? (
              <div className="text-center py-8 text-gray-400 text-sm">
                Loading available flights...
              </div>
            ) : flights.length === 0 ? (
              <div className="text-center py-8 text-gray-400 text-sm">
                No other flights available on this route.
              </div>
            ) : (
              flights.map((flight) => {
                const priceDiff = flight.base_price - currentPrice
                const isSelected = selectedNew?.id === flight.id

                return (
                  <button
                    key={flight.id}
                    onClick={() => setSelectedNew(flight)}
                    className={cn(
                      'w-full text-left border-2 rounded-xl p-4 transition-all',
                      isSelected
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300 bg-white'
                    )}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Plane className="w-3.5 h-3.5 text-blue-600" />
                        <span className="font-bold text-sm text-gray-900">
                          {flight.flight_no}
                        </span>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-sm text-gray-900">
                          {formatPrice(flight.base_price)}
                        </p>
                        {priceDiff > 0 && (
                          <p className="text-xs text-amber-600 font-medium">
                            +{formatPrice(priceDiff)} fee
                          </p>
                        )}
                        {priceDiff <= 0 && (
                          <p className="text-xs text-emerald-600 font-medium">
                            No extra fee
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-sm">
                      <span className="font-semibold text-gray-900">
                        {formatTime(flight.departs_at)}
                      </span>
                      <div className="flex items-center gap-1 text-gray-400 text-xs">
                        <Clock className="w-3 h-3" />
                        {getFlightDuration(flight.departs_at, flight.arrives_at)}
                      </div>
                      <span className="font-semibold text-gray-900">
                        {formatTime(flight.arrives_at)}
                      </span>
                    </div>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {formatDate(flight.departs_at)}
                    </p>
                  </button>
                )
              })
            )}
          </div>

          {/* Error */}
          {error && (
            <p className="mx-6 mb-2 text-sm text-red-500 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          {/* Footer */}
          <div className="px-6 py-4 border-t border-gray-100">
            <button
              onClick={() => setConfirmOpen(true)}
              disabled={!selectedNew || loading}
              className={cn(
                'w-full font-semibold py-3 rounded-xl text-sm text-white transition-colors',
                !selectedNew
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700 active:bg-blue-800'
              )}
            >
              {selectedNew
                ? `Confirm Reschedule${fee > 0 ? ` · Pay ${formatPrice(fee)}` : ' · Free'}`
                : 'Select a flight above'}
            </button>
          </div>
        </div>
      </div>

      {/* Nested confirmation dialog */}
      <ConfirmDialog
        isOpen={confirmOpen}
        variant="warning"
        title="Confirm Reschedule"
        description={
          fee > 0
            ? `You will be rescheduled to ${selectedNew?.flight_no} with an additional fee of ${formatPrice(fee)}.`
            : `You will be rescheduled to ${selectedNew?.flight_no} at no extra charge.`
        }
        confirmLabel="Yes, Reschedule"
        loading={loading}
        onConfirm={handleConfirmReschedule}
        onCancel={() => setConfirmOpen(false)}
      />
    </>
  )
}
