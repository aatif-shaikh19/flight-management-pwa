'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useFlightStore } from '@/stores/useFlightStore'
import { getTodayString } from '@/lib/utils'
import { Search, PlaneTakeoff, PlaneLanding } from 'lucide-react'
import { cn } from '@/lib/utils'

const AIRPORTS = [
  { code: 'BOM', label: 'Mumbai (BOM)' },
  { code: 'DEL', label: 'Delhi (DEL)' },
  { code: 'BLR', label: 'Bangalore (BLR)' },
  { code: 'MAA', label: 'Chennai (MAA)' },
]

export function SearchForm() {
  const router = useRouter()
  const { searchQuery, setSearchQuery } = useFlightStore()

  const [origin, setOrigin] = useState(searchQuery?.origin ?? '')
  const [destination, setDestination] = useState(searchQuery?.destination ?? '')
  const [date, setDate] = useState(searchQuery?.date ?? getTodayString())
  const [passengers, setPassengers] = useState(searchQuery?.passengers ?? 1)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (searchQuery) {
      setOrigin(searchQuery.origin)
      setDestination(searchQuery.destination)
      setDate(searchQuery.date)
      setPassengers(searchQuery.passengers)
    }
  }, [searchQuery])

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    if (!origin || !destination) {
      setError('Please select origin and destination.')
      return
    }
    if (origin === destination) {
      setError('Origin and destination cannot be the same.')
      return
    }
    if (!date) {
      setError('Please select a travel date.')
      return
    }

    // Save to Zustand (persisted — form stays filled if user comes back)
    setSearchQuery({ origin, destination, date, passengers })

    // Navigate to results with URL params
    const params = new URLSearchParams({
      origin,
      destination,
      date,
      passengers: passengers.toString(),
    })
    router.push(`/flights?${params.toString()}`)
  }

  const inputClass = 'w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white'
  const labelClass = 'flex items-center gap-1.5 text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5'

  return (
    <form onSubmit={handleSubmit} className="w-full" suppressHydrationWarning>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">

        <div>
          <label className={labelClass}>
            <PlaneTakeoff className="w-3.5 h-3.5" /> From
          </label>
          <select suppressHydrationWarning value={origin} onChange={(e) => setOrigin(e.target.value)} className={inputClass}>
            <option value="">Select city</option>
            {AIRPORTS.map((a) => (
              <option key={a.code} value={a.code}>{a.label}</option>
            ))}
          </select>
        </div>

        <div>
          <label className={labelClass}>
            <PlaneLanding className="w-3.5 h-3.5" /> To
          </label>
          <select suppressHydrationWarning value={destination} onChange={(e) => setDestination(e.target.value)} className={inputClass}>
            <option value="">Select city</option>
            {AIRPORTS.map((a) => (
              <option key={a.code} value={a.code}>{a.label}</option>
            ))}
          </select>
        </div>

        <div>
          <label className={labelClass}>Date</label>
          <input
            suppressHydrationWarning
            type="date"
            value={date}
            min={getTodayString()}
            onChange={(e) => setDate(e.target.value)}
            className={inputClass}
          />
        </div>

        <div>
          <label className={labelClass}>Passengers</label>
          <select
            suppressHydrationWarning
            value={passengers}
            onChange={(e) => setPassengers(Number(e.target.value))}
            className={inputClass}
          >
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <option key={n} value={n}>{n} passenger{n > 1 ? 's' : ''}</option>
            ))}
          </select>
        </div>
      </div>

      {error && (
        <p className="mt-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
          {error}
        </p>
      )}

      <button
        suppressHydrationWarning
        type="submit"
        className="mt-4 w-full sm:w-auto flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-semibold px-8 py-3 rounded-xl transition-colors"
      >
        <Search className="w-4 h-4" />
        Search Flights
      </button>
    </form>
  )
}
