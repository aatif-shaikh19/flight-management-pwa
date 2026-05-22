'use client'

import { useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Database } from '@/types/supabase'

type Seat = Database['public']['Tables']['seats']['Row']

type UseSeatRealtimeProps = {
  flightId: string
  onSeatUpdate: (updatedSeat: Seat) => void
}

export function useSeatRealtime({ flightId, onSeatUpdate }: UseSeatRealtimeProps) {
  useEffect(() => {
    const supabase = createClient()

    // Subscribe to any UPDATE on the seats table for this specific flight
    const channel = supabase
      .channel(`seats-flight-${flightId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'seats',
          filter: `flight_id=eq.${flightId}`,
        },
        (payload) => {
          // payload.new contains the updated seat row
          onSeatUpdate(payload.new as Seat)
        }
      )
      .subscribe()

    // Cleanup: unsubscribe when component unmounts or flightId changes
    return () => {
      supabase.removeChannel(channel)
    }
  }, [flightId, onSeatUpdate])
}
