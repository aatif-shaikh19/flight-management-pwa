import { formatTime, formatDate, getFlightDuration, formatPrice, getAirportName } from '@/lib/utils'
import { Clock, Plane } from 'lucide-react'
import type { Database } from '@/types/supabase'

type Flight = Database['public']['Tables']['flights']['Row']

type FlightSummaryBarProps = {
  flight: Flight
}

export function FlightSummaryBar({ flight }: FlightSummaryBarProps) {
  const duration = getFlightDuration(flight.departs_at, flight.arrives_at)

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-4 mb-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        {/* Flight number */}
        <div className="flex items-center gap-2">
          <Plane className="w-4 h-4 text-blue-600" />
          <span className="font-bold text-gray-900 text-sm">{flight.flight_no}</span>
          {flight.aircraft_type && (
            <span className="text-xs text-gray-400">{flight.aircraft_type}</span>
          )}
        </div>

        {/* Route + times */}
        <div className="flex items-center gap-3 text-sm">
          <div className="text-center">
            <p className="font-bold text-gray-900">{formatTime(flight.departs_at)}</p>
            <p className="text-xs text-gray-500">{flight.origin}</p>
          </div>

          <div className="flex flex-col items-center text-gray-400 text-xs gap-0.5">
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {duration}
            </span>
            <div className="flex items-center gap-1 w-16">
              <div className="flex-1 h-px bg-gray-200" />
              <Plane className="w-2.5 h-2.5 rotate-90" />
              <div className="flex-1 h-px bg-gray-200" />
            </div>
          </div>

          <div className="text-center">
            <p className="font-bold text-gray-900">{formatTime(flight.arrives_at)}</p>
            <p className="text-xs text-gray-500">{flight.destination}</p>
          </div>
        </div>

        {/* Date + price */}
        <div className="text-right">
          <p className="text-xs text-gray-400">{formatDate(flight.departs_at)}</p>
          <p className="text-sm font-bold text-blue-600">from {formatPrice(flight.base_price)}</p>
        </div>
      </div>
    </div>
  )
}
