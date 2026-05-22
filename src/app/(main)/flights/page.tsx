import { createClient } from '@/lib/supabase/server'
import { FlightCard } from '@/components/flights/FlightCard'
import { getAirportName } from '@/lib/utils'
import { Plane, SearchX } from 'lucide-react'

type FlightsPageProps = {
  searchParams: Promise<{
    origin?: string
    destination?: string
    date?: string
    passengers?: string
  }>
}

export default async function FlightsPage({ searchParams }: FlightsPageProps) {
  const params = await searchParams
  const { origin, destination, date, passengers } = params

  // If no params, redirect prompt
  if (!origin || !destination || !date) {
    return (
      <main className="max-w-6xl mx-auto px-4 py-12 text-center">
        <p className="text-gray-500">Please search for flights from the home page.</p>
        <a href="/" className="mt-4 inline-block text-blue-600 hover:underline text-sm">
          ← Back to search
        </a>
      </main>
    )
  }

  // Build date range for the selected day
  const startOfDay = new Date(`${date}T00:00:00.000Z`).toISOString()
  const endOfDay   = new Date(`${date}T23:59:59.999Z`).toISOString()

  const supabase = await createClient()

  const { data, error } = await supabase
    .from('flights')
    .select('*')
    .eq('origin', origin)
    .eq('destination', destination)
    .gte('departs_at', startOfDay)
    .lte('departs_at', endOfDay)
    .eq('status', 'scheduled')
    .order('departs_at', { ascending: true })

  const flights = data as any[] | null

  if (error) {
    return (
      <main className="max-w-6xl mx-auto px-4 py-12 text-center">
        <p className="text-red-500">Something went wrong loading flights. Please try again.</p>
      </main>
    )
  }

  const passengerCount = Number(passengers ?? 1)

  return (
    <main className="max-w-6xl mx-auto px-4 py-8">
      {/* Page header */}
      <div className="mb-6">
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
          <a href="/" className="hover:text-blue-600">Search</a>
          <span>›</span>
          <span>Results</span>
        </div>
        <h1 className="text-2xl font-bold text-gray-900">
          {getAirportName(origin)} → {getAirportName(destination)}
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          {new Date(date).toLocaleDateString('en-IN', {
            weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
          })}
          {' · '}{passengerCount} passenger{passengerCount > 1 ? 's' : ''}
        </p>
      </div>

      {/* Results count */}
      {flights && flights.length > 0 && (
        <p className="text-sm text-gray-500 mb-4">
          {flights.length} flight{flights.length > 1 ? 's' : ''} found
        </p>
      )}

      {/* Flight list or empty state */}
      {!flights || flights.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <SearchX className="w-12 h-12 text-gray-300 mb-4" />
          <h2 className="text-lg font-semibold text-gray-700">No flights found</h2>
          <p className="text-sm text-gray-400 mt-1 max-w-xs">
            No scheduled flights from {getAirportName(origin)} to {getAirportName(destination)} on this date.
          </p>
          <a
            href="/"
            className="mt-5 text-sm text-blue-600 hover:underline font-medium"
          >
            ← Modify search
          </a>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {flights.map((flight) => (
            <FlightCard
              key={flight.id}
              flight={flight}
              onSelectAction={`/flights/${flight.id}/seats`}
            />
          ))}
        </div>
      )}
    </main>
  )
}
