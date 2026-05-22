'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { SeatButton } from './SeatButton'
import { SeatLegend } from './SeatLegend'
import { useSeatRealtime } from '@/hooks/useSeatRealtime'
import { useFlightStore } from '@/stores/useFlightStore'
import { cn, formatPrice } from '@/lib/utils'
import type { Database } from '@/types/supabase'

type Seat = Database['public']['Tables']['seats']['Row']
type Flight = Database['public']['Tables']['flights']['Row']

type SeatMapProps = {
  flight: Flight
  initialSeats: Seat[]
  bookedSeatIds: string[]  // seat IDs already booked by this user
}

// Column layouts per class
const FIRST_COLS    = ['A', 'C', 'D']   // rows 1-2
const BUSINESS_COLS = ['A', 'B', 'E', 'F']  // rows 3-6
const ECONOMY_COLS  = ['A', 'B', 'C', 'D', 'E', 'F']  // rows 7-18

const CLASS_ROW_RANGES = {
  first:    { start: 1, end: 2 },
  business: { start: 3, end: 6 },
  economy:  { start: 7, end: 18 },
}

type SeatClass = 'first' | 'business' | 'economy'

const CLASS_LABELS: Record<SeatClass, string> = {
  first:    '✦ First Class',
  business: '◈ Business',
  economy:  '· Economy',
}

const CLASS_HEADER_COLORS: Record<SeatClass, string> = {
  first:    'bg-amber-50 border-amber-200 text-amber-800',
  business: 'bg-blue-50 border-blue-200 text-blue-800',
  economy:  'bg-gray-50 border-gray-200 text-gray-700',
}

export function SeatMap({ flight, initialSeats, bookedSeatIds }: SeatMapProps) {
  const router = useRouter()
  const { selectedSeat, setSelectedSeat, setSelectedFlight } = useFlightStore()
  const [seats, setSeats] = useState<Seat[]>(initialSeats)

  // Realtime: update a single seat when another user books it
  const handleSeatUpdate = useCallback((updatedSeat: Seat) => {
    setSeats((prev) =>
      prev.map((s) => (s.id === updatedSeat.id ? updatedSeat : s))
    )
    // If this user had selected the just-booked seat, deselect it
    if (selectedSeat?.id === updatedSeat.id && !updatedSeat.is_available) {
      setSelectedSeat(null as unknown as Seat)
    }
  }, [selectedSeat, setSelectedSeat])

  useSeatRealtime({ flightId: flight.id, onSeatUpdate: handleSeatUpdate })

  // Build a lookup map: "7A" → Seat object
  const seatMap = new Map(seats.map((s) => [s.seat_number, s]))

  function renderClass(seatClass: SeatClass) {
    const { start, end } = CLASS_ROW_RANGES[seatClass]
    const cols = seatClass === 'first'
      ? FIRST_COLS
      : seatClass === 'business'
      ? BUSINESS_COLS
      : ECONOMY_COLS

    const rows = Array.from({ length: end - start + 1 }, (_, i) => start + i)

    return (
      <div key={seatClass} className="mb-6">
        {/* Class header */}
        <div className={cn(
          'text-xs font-bold px-4 py-2 rounded-lg border mb-3 text-center uppercase tracking-widest',
          CLASS_HEADER_COLORS[seatClass]
        )}>
          {CLASS_LABELS[seatClass]}
        </div>

        {/* Column headers */}
        <div className={cn(
          'flex gap-1 sm:gap-2 mb-1 px-6 sm:px-8',
          seatClass === 'economy' ? 'justify-between' : 'justify-center'
        )}>
          {seatClass === 'economy' ? (
            // Economy: A B C | D E F (with aisle gap label)
            <>
              {['A', 'B', 'C'].map((c) => (
                <span key={c} className="w-9 sm:w-10 text-center text-xs font-bold text-gray-400">{c}</span>
              ))}
              <span className="w-4 sm:w-6" />
              {['D', 'E', 'F'].map((c) => (
                <span key={c} className="w-9 sm:w-10 text-center text-xs font-bold text-gray-400">{c}</span>
              ))}
            </>
          ) : seatClass === 'business' ? (
            // Business: A B | E F
            <>
              {['A', 'B'].map((c) => (
                <span key={c} className="w-11 sm:w-12 text-center text-xs font-bold text-gray-400">{c}</span>
              ))}
              <span className="w-6 sm:w-8" />
              {['E', 'F'].map((c) => (
                <span key={c} className="w-11 sm:w-12 text-center text-xs font-bold text-gray-400">{c}</span>
              ))}
            </>
          ) : (
            // First: A | C D
            <>
              {['A'].map((c) => (
                <span key={c} className="w-[52px] sm:w-14 text-center text-xs font-bold text-gray-400">{c}</span>
              ))}
              <span className="w-8 sm:w-10" />
              {['C', 'D'].map((c) => (
                <span key={c} className="w-[52px] sm:w-14 text-center text-xs font-bold text-gray-400">{c}</span>
              ))}
            </>
          )}
        </div>

        {/* Rows */}
        <div className="flex flex-col gap-1.5">
          {rows.map((rowNum) => (
            <div key={rowNum} className="flex items-center gap-1 sm:gap-2">
              {/* Row number */}
              <span className="w-5 sm:w-6 text-right text-xs text-gray-300 font-mono shrink-0">
                {rowNum}
              </span>

              {/* Seats with aisle gap */}
              <div className={cn(
                'flex gap-1 sm:gap-1.5 flex-1',
                seatClass === 'economy' ? 'justify-between' : 'justify-center'
              )}>
                {seatClass === 'economy' ? (
                  <>
                    {['A', 'B', 'C'].map((col) => {
                      const seat = seatMap.get(`${rowNum}${col}`)
                      if (!seat) return <div key={col} className="w-9 sm:w-10 h-11" />
                      return (
                        <SeatButton
                          key={seat.id}
                          seat={seat}
                          isSelected={selectedSeat?.id === seat.id}
                          isBooked={bookedSeatIds.includes(seat.id)}
                          onSelect={setSelectedSeat}
                        />
                      )
                    })}
                    {/* Aisle */}
                    <div className="w-4 sm:w-6 flex items-center justify-center">
                      <span className="text-xs text-gray-200">|</span>
                    </div>
                    {['D', 'E', 'F'].map((col) => {
                      const seat = seatMap.get(`${rowNum}${col}`)
                      if (!seat) return <div key={col} className="w-9 sm:w-10 h-11" />
                      return (
                        <SeatButton
                          key={seat.id}
                          seat={seat}
                          isSelected={selectedSeat?.id === seat.id}
                          isBooked={bookedSeatIds.includes(seat.id)}
                          onSelect={setSelectedSeat}
                        />
                      )
                    })}
                  </>
                ) : seatClass === 'business' ? (
                  <>
                    {['A', 'B'].map((col) => {
                      const seat = seatMap.get(`${rowNum}${col}`)
                      if (!seat) return <div key={col} className="w-11 sm:w-12 h-11 sm:h-12" />
                      return (
                        <SeatButton
                          key={seat.id}
                          seat={seat}
                          isSelected={selectedSeat?.id === seat.id}
                          isBooked={bookedSeatIds.includes(seat.id)}
                          onSelect={setSelectedSeat}
                        />
                      )
                    })}
                    <div className="w-6 sm:w-8" />
                    {['E', 'F'].map((col) => {
                      const seat = seatMap.get(`${rowNum}${col}`)
                      if (!seat) return <div key={col} className="w-11 sm:w-12 h-11 sm:h-12" />
                      return (
                        <SeatButton
                          key={seat.id}
                          seat={seat}
                          isSelected={selectedSeat?.id === seat.id}
                          isBooked={bookedSeatIds.includes(seat.id)}
                          onSelect={setSelectedSeat}
                        />
                      )
                    })}
                  </>
                ) : (
                  // First class
                  <>
                    {['A'].map((col) => {
                      const seat = seatMap.get(`${rowNum}${col}`)
                      if (!seat) return <div key={col} className="w-[52px] sm:w-14 h-[52px] sm:h-14" />
                      return (
                        <SeatButton
                          key={seat.id}
                          seat={seat}
                          isSelected={selectedSeat?.id === seat.id}
                          isBooked={bookedSeatIds.includes(seat.id)}
                          onSelect={setSelectedSeat}
                        />
                      )
                    })}
                    <div className="w-8 sm:w-10" />
                    {['C', 'D'].map((col) => {
                      const seat = seatMap.get(`${rowNum}${col}`)
                      if (!seat) return <div key={col} className="w-[52px] sm:w-14 h-[52px] sm:h-14" />
                      return (
                        <SeatButton
                          key={seat.id}
                          seat={seat}
                          isSelected={selectedSeat?.id === seat.id}
                          isBooked={bookedSeatIds.includes(seat.id)}
                          onSelect={setSelectedSeat}
                        />
                      )
                    })}
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  const totalPrice = selectedSeat
    ? flight.base_price + (selectedSeat.extra_fee ?? 0)
    : null

  return (
    <div className="flex flex-col">
      {/* Legend */}
      <div className="mb-6">
        <SeatLegend />
      </div>

      {/* Scrollable seat grid */}
      <div className="overflow-x-auto pb-4">
        <div className="min-w-[280px] sm:min-w-[320px] max-w-md mx-auto">
          {/* Nose of plane */}
          <div className="flex justify-center mb-4">
            <div className="bg-gray-100 border border-gray-200 text-gray-400 text-xs px-6 py-1.5 rounded-full">
              ✈ Front of Aircraft
            </div>
          </div>

          {renderClass('first')}
          {renderClass('business')}
          {renderClass('economy')}

          {/* Tail of plane */}
          <div className="flex justify-center mt-2">
            <div className="bg-gray-100 border border-gray-200 text-gray-400 text-xs px-6 py-1.5 rounded-full">
              Rear of Aircraft
            </div>
          </div>
        </div>
      </div>

      {/* Sticky footer: selected seat info + continue button */}
      {selectedSeat && (
        <div className="sticky bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg px-4 py-4 mt-4">
          <div className="max-w-md mx-auto flex items-center justify-between gap-4">
            <div>
              <p className="text-xs text-gray-500">Selected</p>
              <p className="font-bold text-gray-900">
                Seat {selectedSeat.seat_number}
                <span className="ml-2 text-xs font-normal text-gray-500 capitalize">
                  {selectedSeat.class}
                </span>
              </p>
              {totalPrice && (
                <p className="text-blue-600 font-semibold text-sm">
                  {formatPrice(totalPrice)}
                </p>
              )}
            </div>
            <button
              onClick={() => {
                setSelectedFlight(flight)
                router.push('/booking/details')
              }}
              className="bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-semibold px-6 py-3 rounded-xl transition-colors whitespace-nowrap"
            >
              Continue →
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
