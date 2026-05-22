import { create } from 'zustand'
import { persist, createJSONStorage, devtools } from 'zustand/middleware'
import type { Database } from '@/types/supabase'

type Flight = Database['public']['Tables']['flights']['Row']
type Seat   = Database['public']['Tables']['seats']['Row']

export type SearchQuery = {
  origin: string
  destination: string
  date: string
  passengers: number
}

export type BookingStep = 'search' | 'seat' | 'details' | 'confirmed'

// passportNo intentionally excluded — never persisted (PII)
export type PassengerFormState = {
  fullName:    string
  nationality: string
  dob:         string
}

type FlightStore = {
  searchQuery:    SearchQuery | null
  selectedFlight: Flight | null
  selectedSeat:   Seat | null
  bookingStep:    BookingStep
  passengerForm:  PassengerFormState

  setSearchQuery:    (query: SearchQuery) => void
  setSelectedFlight: (flight: Flight) => void
  setSelectedSeat:   (seat: Seat | null) => void
  setBookingStep:    (step: BookingStep) => void
  setPassengerForm:  (data: Partial<PassengerFormState>) => void
  resetBookingFlow:  () => void
  reset:             () => void
}

const DEFAULT_PASSENGER_FORM: PassengerFormState = {
  fullName:    '',
  nationality: '',
  dob:         '',
}

const INITIAL_STATE = {
  searchQuery:    null,
  selectedFlight: null,
  selectedSeat:   null,
  bookingStep:    'search' as BookingStep,
  passengerForm:  DEFAULT_PASSENGER_FORM,
}

export const useFlightStore = create<FlightStore>()(
  devtools(
    persist(
      (set) => ({
        ...INITIAL_STATE,

        setSearchQuery: (query) =>
          set({ searchQuery: query }, false, 'setSearchQuery'),

        setSelectedFlight: (flight) =>
          set({ selectedFlight: flight, bookingStep: 'seat' }, false, 'setSelectedFlight'),

        setSelectedSeat: (seat) =>
          set({ selectedSeat: seat }, false, 'setSelectedSeat'),

        setBookingStep: (step) =>
          set({ bookingStep: step }, false, 'setBookingStep'),

        setPassengerForm: (data) =>
          set(
            (state) => ({ passengerForm: { ...state.passengerForm, ...data } }),
            false,
            'setPassengerForm'
          ),

        resetBookingFlow: () =>
          set(
            {
              selectedFlight: null,
              selectedSeat:   null,
              bookingStep:    'search',
              passengerForm:  DEFAULT_PASSENGER_FORM,
            },
            false,
            'resetBookingFlow'
          ),

        reset: () =>
          set(INITIAL_STATE, false, 'reset'),
      }),
      {
        name: 'flight-store',
        storage: createJSONStorage(() => localStorage),
        // SECURITY: only persist safe fields
        // passportNo is NEVER here — lives in component useState only
        partialize: (state) => ({
          searchQuery:  state.searchQuery,
          bookingStep:  state.bookingStep,
          passengerForm: {
            fullName:    state.passengerForm.fullName,
            nationality: state.passengerForm.nationality,
            dob:         state.passengerForm.dob,
            // passportNo intentionally omitted — PII
          },
        }),
      }
    ),
    { name: 'FlightStore' }
  )
)
