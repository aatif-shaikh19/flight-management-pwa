import { createClient } from '@/lib/supabase/server'
import { BookingDetailsLoader } from '@/components/bookings/BookingDetailsLoader'
import { redirect } from 'next/navigation'

export default async function BookingDetailsPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login?redirectTo=/booking/details')

  return (
    <main className="max-w-lg mx-auto px-4 sm:px-6 py-6 sm:py-8">
      <div className="flex items-center gap-2 text-sm text-gray-400 mb-4">
        <a href="/" className="hover:text-blue-600">Search</a>
        <span>›</span>
        <span>Select Seat</span>
        <span>›</span>
        <span className="text-gray-900 font-medium">Passenger Details</span>
      </div>
      <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-1">
        Passenger Details
      </h1>
      <p className="text-sm text-gray-500 mb-6 sm:mb-8">
        Enter details exactly as they appear on your passport.
      </p>
      <BookingDetailsLoader userId={user.id} />
    </main>
  )
}
