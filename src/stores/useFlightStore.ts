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

export type BookingStep = 'search' | 'seat' | 'details' | 'confirmed'

// passportNo intentionally excluded — never persisted (PII)
export type PassengerFormState = {
  fullName: string
  nationality: string
  dob: string
}

type FlightStore = {
  // Search
  searchQuery: SearchQuery | null
  setSearchQuery: (query: SearchQuery) => void

  // Selected flight
  selectedFlight: Flight | null
  setSelectedFlight: (flight: Flight) => void

  // Selected seat
  selectedSeat: Seat | null
  setSelectedSeat: (seat: Seat | null) => void

  // Booking progress
  bookingStep: BookingStep
  setBookingStep: (step: BookingStep) => void

  // Passenger form (passport excluded — lives in component state only)
  passengerForm: PassengerFormState
  setPassengerForm: (data: Partial<PassengerFormState>) => void

  // Reset booking flow (keep search query)
  resetBookingFlow: () => void

  // Full reset (on logout)
  reset: () => void
}

const DEFAULT_PASSENGER_FORM: PassengerFormState = {
  fullName: '',
  nationality: '',
  dob: '',
}

export const useFlightStore = create<FlightStore>()(
  persist(
    (set) => ({
      searchQuery: null,
      setSearchQuery: (query) => set({ searchQuery: query }),

      selectedFlight: null,
      setSelectedFlight: (flight) => set({
        selectedFlight: flight,
        bookingStep: 'seat',
      }),

      selectedSeat: null,
      setSelectedSeat: (seat) => set({ selectedSeat: seat }),

      bookingStep: 'search',
      setBookingStep: (step) => set({ bookingStep: step }),

      passengerForm: DEFAULT_PASSENGER_FORM,
      setPassengerForm: (data) =>
        set((state) => ({
          passengerForm: { ...state.passengerForm, ...data },
        })),

      resetBookingFlow: () =>
        set({
          selectedFlight: null,
          selectedSeat: null,
          bookingStep: 'search',
          passengerForm: DEFAULT_PASSENGER_FORM,
        }),

      reset: () =>
        set({
          searchQuery: null,
          selectedFlight: null,
          selectedSeat: null,
          bookingStep: 'search',
          passengerForm: DEFAULT_PASSENGER_FORM,
        }),
    }),
    {
      name: 'flight-store',
      storage: createJSONStorage(() => localStorage),
      // CRITICAL: only persist safe fields
      // passportNo is NEVER included here — it never leaves component state
      partialize: (state) => ({
        searchQuery: state.searchQuery,
        bookingStep: state.bookingStep,
        passengerForm: {
          fullName: state.passengerForm.fullName,
          nationality: state.passengerForm.nationality,
          dob: state.passengerForm.dob,
          // passportNo intentionally omitted
        },
      }),
    }
  )
)
