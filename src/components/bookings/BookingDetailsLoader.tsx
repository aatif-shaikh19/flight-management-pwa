'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useFlightStore } from '@/stores/useFlightStore'
import { createClient } from '@/lib/supabase/client'
import { PassengerForm } from './PassengerForm'
import { Plane } from 'lucide-react'
import type { Database } from '@/types/supabase'

type Flight = Database['public']['Tables']['flights']['Row']
type Seat   = Database['public']['Tables']['seats']['Row']

type BookingDetailsLoaderProps = {
  userId: string
}

export function BookingDetailsLoader({ userId }: BookingDetailsLoaderProps) {
  const router = useRouter()
  const { selectedFlight, selectedSeat } = useFlightStore()

  const [flight, setFlight] = useState<Flight | null>(null)
  const [seat,   setSeat]   = useState<Seat   | null>(null)
  const [loading, setLoading] = useState(true)
  const [error,   setError]  = useState<string | null>(null)

  useEffect(() => {
    // Guard: if no selection, send back to home
    if (!selectedFlight || !selectedSeat) {
      router.replace('/')
      return
    }

    // Fetch fresh flight + seat data (verify still available)
    async function loadData() {
      const supabase = createClient()

      const [flightRes, seatRes] = await Promise.all([
        supabase.from('flights').select('*').eq('id', selectedFlight!.id).single(),
        supabase.from('seats').select('*').eq('id', selectedSeat!.id).single(),
      ])

      if (flightRes.error || seatRes.error) {
        setError('Could not load booking details. Please try again.')
        setLoading(false)
        return
      }
      
      const seatData = seatRes.data as any

      if (!seatData.is_available) {
        setError('Sorry, this seat was just taken. Please select a different seat.')
        setLoading(false)
        return
      }

      setFlight(flightRes.data as any)
      setSeat(seatData)
      setLoading(false)
    }

    loadData()
  }, [selectedFlight, selectedSeat, router])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="flex items-center gap-3 text-gray-400">
          <Plane className="w-5 h-5 animate-pulse" />
          <span className="text-sm">Loading booking details...</span>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-500 mb-4">{error}</p>
        <button
          onClick={() => router.back()}
          className="text-sm text-blue-600 hover:underline"
        >
          ← Go back and select a seat
        </button>
      </div>
    )
  }

  if (!flight || !seat) return null

  return <PassengerForm flight={flight} seat={seat} />
}
