import { createClient } from '@/lib/supabase/server'
import { BookingCard } from '@/components/bookings/BookingCard'
import { redirect } from 'next/navigation'
import { Plane } from 'lucide-react'

export default async function BookingsPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login?redirectTo=/bookings')

  const { data: bookingsData, error } = await supabase
    .from('bookings')
    .select(`
      *,
      flights (*),
      seats (*),
      passengers (*)
    `)
    .eq('user_id', user.id)
    .order('booked_at', { ascending: false })

  const bookings = bookingsData as any[]

  if (error) {
    return (
      <main className="max-w-2xl mx-auto px-4 py-8">
        <p className="text-red-500 text-sm">
          Could not load bookings. Please refresh.
        </p>
      </main>
    )
  }

  return (
    <main className="max-w-2xl mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">My Bookings</h1>
        <p className="text-sm text-gray-500 mt-1">
          {bookings?.length
            ? `${bookings.length} booking${bookings.length > 1 ? 's' : ''} found`
            : 'No bookings yet'}
        </p>
      </div>

      {!bookings || bookings.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <Plane className="w-7 h-7 text-gray-300" />
          </div>
          <h2 className="text-lg font-semibold text-gray-700">No bookings yet</h2>
          <p className="text-sm text-gray-400 mt-1 max-w-xs">
            When you book a flight, it will appear here.
          </p>
          <a
            href="/"
            className="mt-5 text-sm text-blue-600 hover:underline font-medium"
          >
            Search for flights →
          </a>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {bookings.map((booking) => (
            <BookingCard
              key={booking.id}
              booking={booking as Parameters<typeof BookingCard>[0]['booking']}
            />
          ))}
        </div>
      )}
    </main>
  )
}
