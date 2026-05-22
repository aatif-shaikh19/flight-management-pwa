import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type { Database } from '@/types/supabase'

type Flight = Database['public']['Tables']['flights']['Row']
type Seat = Database['public']['Tables']['seats']['Row']

export type SearchQuery = {
  origin: string
  destination: string
  date: string
  passengers: number
}

type FlightStore = {
  // Search
  searchQuery: SearchQuery | null
  setSearchQuery: (query: SearchQuery) => void

  // Selected flight (set when user clicks a flight card)
  selectedFlight: Flight | null
  setSelectedFlight: (flight: Flight) => void

  // Selected seat (set in seat map phase)
  selectedSeat: Seat | null
  setSelectedSeat: (seat: Seat) => void

  // Reset only the booking flow (keep search)
  resetBookingFlow: () => void

  // Full reset (on logout)
  reset: () => void
}

export const useFlightStore = create<FlightStore>()(
  persist(
    (set) => ({
      searchQuery: null,
      setSearchQuery: (query) => set({ searchQuery: query }),

      selectedFlight: null,
      setSelectedFlight: (flight) => set({ selectedFlight: flight }),

      selectedSeat: null,
      setSelectedSeat: (seat) => set({ selectedSeat: seat }),

      resetBookingFlow: () => set({
        selectedFlight: null,
        selectedSeat: null,
      }),

      reset: () => set({
        searchQuery: null,
        selectedFlight: null,
        selectedSeat: null,
      }),
    }),
    {
      name: 'flight-store',
      storage: createJSONStorage(() => localStorage),
      // Only persist the search query — not selected flight/seat
      partialize: (state) => ({
        searchQuery: state.searchQuery,
      }),
    }
  )
)
