import { SearchForm } from '@/components/flights/SearchForm'
import { Plane, Shield, Zap, Clock } from 'lucide-react'

export default function HomePage() {
  return (
    <main>
      {/* Hero */}
      <section className="bg-gradient-to-br from-blue-600 to-blue-800 text-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
          <div className="flex items-center gap-2 mb-3">
            <Plane className="w-4 h-4" />
            <span className="text-blue-200 text-xs sm:text-sm font-medium uppercase tracking-wide">
              Book your next flight
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-2 leading-tight">
            Where would you like to go?
          </h1>
          <p className="text-blue-200 mb-6 sm:mb-8 text-sm max-w-md">
            Search flights across Mumbai, Delhi, Bangalore, and Chennai.
          </p>

          {/* Search card */}
          <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-xl">
            <SearchForm />
          </div>
        </div>
      </section>

      {/* Trust strip */}
      <section className="border-b border-gray-100 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
          <div className="grid grid-cols-3 gap-3 sm:gap-6 text-center">
            {[
              { icon: Plane,  label: 'Routes',  value: '4 cities'    },
              { icon: Zap,    label: 'Booking', value: 'Instant PNR' },
              { icon: Shield, label: 'Security', value: 'Secure seats'       },
            ].map(({ icon: Icon, label, value }) => (
              <div key={label} className="flex flex-col items-center gap-1">
                <Icon className="w-4 h-4 text-blue-500" />
                <p className="text-sm sm:text-base font-bold text-gray-900">{value}</p>
                <p className="text-xs text-gray-400">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  )
}
