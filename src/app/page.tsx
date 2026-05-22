import { SearchForm } from '@/components/flights/SearchForm'
import { Plane } from 'lucide-react'

export default function HomePage() {
  return (
    <main>
      {/* Hero */}
      <section className="bg-gradient-to-br from-blue-600 to-blue-800 text-white">
        <div className="max-w-6xl mx-auto px-4 py-14">
          <div className="flex items-center gap-2 mb-3">
            <Plane className="w-5 h-5" />
            <span className="text-blue-200 text-sm font-medium uppercase tracking-wide">
              Book your next flight
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold mb-2">
            Where would you like to go?
          </h1>
          <p className="text-blue-200 mb-8 text-sm">
            Search flights across Mumbai, Delhi, Bangalore, and Chennai.
          </p>

          {/* Search form on a white card */}
          <div className="bg-white rounded-2xl p-6 shadow-xl">
            <SearchForm />
          </div>
        </div>
      </section>

      {/* Info strip */}
      <section className="border-b border-gray-100 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 py-6 grid grid-cols-3 gap-4 text-center">
          {[
            { label: 'Routes', value: '4 cities' },
            { label: 'Flights', value: '8 daily' },
            { label: 'Booking', value: 'Instant PNR' },
          ].map(({ label, value }) => (
            <div key={label}>
              <p className="text-lg font-bold text-gray-900">{value}</p>
              <p className="text-xs text-gray-400">{label}</p>
            </div>
          ))}
        </div>
      </section>
    </main>
  )
}
