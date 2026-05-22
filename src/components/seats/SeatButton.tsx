'use client'

import { useState } from 'react'
import { cn, formatPrice } from '@/lib/utils'
import type { Database } from '@/types/supabase'

type Seat = Database['public']['Tables']['seats']['Row']

type SeatButtonProps = {
  seat: Seat
  isSelected: boolean
  isBooked: boolean   // already booked by current user in a confirmed booking
  onSelect: (seat: Seat) => void
}

export function SeatButton({ seat, isSelected, isBooked, onSelect }: SeatButtonProps) {
  const [showTooltip, setShowTooltip] = useState(false)

  const isOccupied = !seat.is_available && !isBooked

  const colorClass = cn({
    // Occupied by someone else — red, not clickable
    'bg-red-100 border-red-300 text-red-400 cursor-not-allowed': isOccupied,
    // Already booked by this user — amber
    'bg-amber-100 border-amber-400 text-amber-700 cursor-default': isBooked,
    // Selected right now — blue
    'bg-blue-100 border-blue-500 text-blue-700 ring-2 ring-blue-300': isSelected && !isBooked,
    // Available — green, clickable
    'bg-emerald-50 border-emerald-300 text-emerald-700 hover:bg-emerald-100 hover:border-emerald-500 active:scale-95': 
      seat.is_available && !isSelected && !isBooked,
  })

  const sizeClass = cn({
    'w-9 sm:w-10 h-11 text-xs': seat.class === 'economy',
    'w-11 sm:w-12 h-11 sm:h-12 text-xs': seat.class === 'business',
    'w-13 sm:w-14 h-13 sm:h-14 text-sm': seat.class === 'first',
  })

  function handleClick() {
    if (isOccupied || isBooked) return
    onSelect(seat)
  }

  return (
    <div className="relative">
      <button
        onClick={handleClick}
        disabled={isOccupied}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        onTouchStart={() => setShowTooltip(true)}
        onTouchEnd={() => setTimeout(() => setShowTooltip(false), 1500)}
        aria-label={`Seat ${seat.seat_number}, ${seat.class}, ${isOccupied ? 'occupied' : 'available'}${(seat.extra_fee ?? 0) > 0 ? `, extra fee ${formatPrice(seat.extra_fee ?? 0)}` : ''}`}
        className={cn(
          'flex items-center justify-center rounded-lg border-2 font-semibold transition-all',
          sizeClass,
          colorClass
        )}
      >
        {seat.seat_number}
      </button>

      {/* Tooltip — shows on hover or touch */}
      {showTooltip && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-10 pointer-events-none">
          <div className="bg-gray-900 text-white text-xs rounded-lg px-2.5 py-1.5 whitespace-nowrap shadow-lg">
            <p className="font-semibold capitalize">{seat.class} Class</p>
            {(seat.extra_fee ?? 0) > 0 && (
              <p className="text-gray-300">+{formatPrice(seat.extra_fee ?? 0)}</p>
            )}
            <p className="text-gray-300">{isOccupied ? 'Occupied' : isBooked ? 'Your seat' : 'Available'}</p>
          </div>
          {/* Tooltip arrow */}
          <div className="w-2 h-2 bg-gray-900 rotate-45 mx-auto -mt-1" />
        </div>
      )}
    </div>
  )
}
