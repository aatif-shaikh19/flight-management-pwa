import { createClient } from '@/lib/supabase/server'
import { FlightCard } from '@/components/flights/FlightCard'
import { getAirportName } from '@/lib/utils'
import { SearchX, ArrowLeft } from 'lucide-react'

type FlightsPageProps = {
  searchParams: Promise<{
    origin?:     string
    destination?: string
    date?:       string
    passengers?: string
  }>
}

export default async function FlightsPage({ searchParams }: FlightsPageProps) {
  const params = await searchParams
  const { origin, destination, date, passengers } = params

  if (!origin || !destination || !date) {
    return (
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-12 text-center">
        <p className="text-gray-500 mb-3">Please search for flights from the home page.</p>
        <a href="/" className="inline-flex items-center gap-1 text-blue-600 hover:underline text-sm font-medium">
          <ArrowLeft className="w-3.5 h-3.5" /> Back to search
        </a>
      </main>
    )
  }

  const startOfDay = new Date(`${date}T00:00:00.000Z`).toISOString()
  const endOfDay   = new Date(`${date}T23:59:59.999Z`).toISOString()

  const supabase = await createClient()

  const { data: flights, error } = await supabase
    .from('flights')
    .select('*')
    .eq('origin', origin)
    .eq('destination', destination)
    .gte('departs_at', startOfDay)
    .lte('departs_at', endOfDay)
    .eq('status', 'scheduled')
    .order('departs_at', { ascending: true })

  if (error) {
    return (
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-12 text-center">
        <p className="text-red-500 text-sm">Something went wrong. Please try again.</p>
      </main>
    )
  }

  const passengerCount = Number(passengers ?? 1)

  return (
    <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8">

      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-400 mb-3">
        <a href="/" className="hover:text-blue-600 flex items-center gap-1 font-medium">
          <ArrowLeft className="w-3.5 h-3.5" /> Search
        </a>
        <span>›</span>
        <span className="text-gray-600">Results</span>
      </div>

      {/* Page header */}
      <div className="mb-5 sm:mb-6">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
          {getAirportName(origin)} → {getAirportName(destination)}
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          {new Date(date).toLocaleDateString('en-IN', {
            weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
          })}
          {' · '}{passengerCount} passenger{passengerCount > 1 ? 's' : ''}
        </p>
      </div>

      {flights && flights.length > 0 && (
        <p className="text-sm text-gray-400 mb-4">
          {flights.length} flight{flights.length > 1 ? 's' : ''} found
        </p>
      )}

      {!flights || flights.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 sm:py-20 text-center">
          <SearchX className="w-10 h-10 sm:w-12 sm:h-12 text-gray-300 mb-4" />
          <h2 className="text-base sm:text-lg font-semibold text-gray-700">No flights found</h2>
          <p className="text-sm text-gray-400 mt-1 max-w-xs">
            No scheduled flights from {getAirportName(origin)} to {getAirportName(destination)} on this date.
          </p>
          
          <a
            href="/"
            className="mt-5 inline-flex items-center gap-1 text-sm text-blue-600 hover:underline font-medium"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Modify search
          </a>
        </div>
      ) : (
        <div className="flex flex-col gap-3 sm:gap-4">
          {flights.map((flight: any) => (
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
