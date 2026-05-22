import { cn, formatTime, formatDate, getFlightDuration, formatPrice, getAirportName } from '@/lib/utils'
import { Clock, Plane } from 'lucide-react'
import type { Database } from '@/types/supabase'

type Flight = Database['public']['Tables']['flights']['Row']

type FlightCardProps = {
  flight: Flight
  onSelectAction: string  // URL to navigate to when selected
}

export function FlightCard({ flight, onSelectAction }: FlightCardProps) {
  const duration = getFlightDuration(flight.departs_at, flight.arrives_at)
  const statusColors: Record<string, string> = {
    scheduled: 'bg-green-50 text-green-700 border-green-200',
    delayed:   'bg-yellow-50 text-yellow-700 border-yellow-200',
    cancelled: 'bg-red-50 text-red-700 border-red-200',
  }

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-5 hover:border-blue-300 hover:shadow-md transition-all">
      {/* Header: flight number + status */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Plane className="w-4 h-4 text-blue-600" />
          <span className="font-bold text-gray-900 text-sm">{flight.flight_no}</span>
          {flight.aircraft_type && (
            <span className="text-xs text-gray-400">{flight.aircraft_type}</span>
          )}
        </div>
        <span className={cn(
          'text-xs font-medium px-2.5 py-0.5 rounded-full border capitalize',
          statusColors[flight.status ?? 'scheduled'] ?? statusColors['scheduled']
        )}>
          {flight.status}
        </span>
      </div>

      {/* Route: origin → destination */}
      <div className="flex items-center gap-3 mb-4">
        <div className="text-center">
          <p className="text-2xl font-bold text-gray-900">{formatTime(flight.departs_at)}</p>
          <p className="text-xs text-gray-500 mt-0.5">{getAirportName(flight.origin)}</p>
          <p className="text-xs font-bold text-gray-700">{flight.origin}</p>
        </div>

        <div className="flex-1 flex flex-col items-center gap-1">
          <div className="flex items-center gap-1 text-xs text-gray-400">
            <Clock className="w-3 h-3" />
            <span>{duration}</span>
          </div>
          <div className="w-full flex items-center gap-1">
            <div className="flex-1 h-px bg-gray-200" />
            <Plane className="w-3 h-3 text-gray-400 rotate-90" />
            <div className="flex-1 h-px bg-gray-200" />
          </div>
          <p className="text-xs text-gray-400">{formatDate(flight.departs_at)}</p>
        </div>

        <div className="text-center">
          <p className="text-2xl font-bold text-gray-900">{formatTime(flight.arrives_at)}</p>
          <p className="text-xs text-gray-500 mt-0.5">{getAirportName(flight.destination)}</p>
          <p className="text-xs font-bold text-gray-700">{flight.destination}</p>
        </div>
      </div>

      {/* Footer: price + book button */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
        <div>
          <p className="text-xs text-gray-400">Starting from</p>
          <p className="text-xl font-bold text-blue-600">{formatPrice(flight.base_price)}</p>
        </div>
        <a
          href={onSelectAction}
          className="bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors"
        >
          Select Seats →
        </a>
      </div>
    </div>
  )
}
