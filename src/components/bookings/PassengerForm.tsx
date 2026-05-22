'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useFlightStore } from '@/stores/useFlightStore'
import { createBooking } from '@/app/booking/actions'
import { cn, formatPrice } from '@/lib/utils'
import { User, CreditCard, Globe, Calendar, AlertCircle, ArrowLeft } from 'lucide-react'
import type { Database } from '@/types/supabase'

type Flight = Database['public']['Tables']['flights']['Row']
type Seat   = Database['public']['Tables']['seats']['Row']

type PassengerFormProps = {
  flight: Flight
  seat: Seat
}

export function PassengerForm({ flight, seat }: PassengerFormProps) {
  const router = useRouter()
  const { passengerForm, setPassengerForm, setBookingStep, resetBookingFlow } = useFlightStore()

  // Non-sensitive fields in Zustand (resume-able)
  const [fullName,    setFullName]    = useState(passengerForm.fullName)
  const [nationality, setNationality] = useState(passengerForm.nationality)
  const [dob,         setDob]         = useState(passengerForm.dob)

  // PASSPORT — local state ONLY, never Zustand, never localStorage
  const [passportNo, setPassportNo] = useState('')

  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({})
  const [globalError, setGlobalError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  // Sync non-sensitive fields to Zustand as user types (for resume)
  useEffect(() => {
    setPassengerForm({ fullName, nationality, dob })
  }, [fullName, nationality, dob])

  const totalPrice = flight.base_price + (seat.extra_fee ?? 0)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setFieldErrors({})
    setGlobalError(null)
    setLoading(true)

    const result = await createBooking(
      flight.id,
      seat.id,
      totalPrice,
      { fullName, passportNo, nationality, dob }
    )

    if (!result.success) {
      if (result.fieldErrors) setFieldErrors(result.fieldErrors)
      setGlobalError(result.error)
      setLoading(false)
      return
    }

    // Success — clear booking state and go to confirmation
    setBookingStep('confirmed')
    router.push(`/booking/confirm?pnr=${result.pnrCode}`)
  }

  const inputClass = (hasError: boolean) => cn(
    'w-full border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 transition-colors',
    hasError
      ? 'border-red-300 focus:ring-red-200 bg-red-50'
      : 'border-gray-200 focus:ring-blue-200 focus:border-blue-400 bg-white'
  )

  const labelClass = 'flex items-center gap-1.5 text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1.5'

  function FieldError({ field }: { field: string }) {
    const errs = fieldErrors[field]
    if (!errs?.length) return null
    return <p className="mt-1 text-xs text-red-500">{errs[0]}</p>
  }

  return (
    <form suppressHydrationWarning onSubmit={handleSubmit} className="flex flex-col gap-5">
      {/* Booking summary card */}
      <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4">
        <p className="text-xs font-semibold text-blue-600 uppercase tracking-wide mb-2">
          Booking Summary
        </p>
        <div className="flex justify-between items-center text-sm">
          <span className="text-gray-600">
            {flight.flight_no} · Seat {seat.seat_number}
            <span className="ml-1 capitalize text-gray-400">({seat.class})</span>
          </span>
          <span className="font-bold text-gray-900">{formatPrice(totalPrice)}</span>
        </div>
        <div className="flex justify-between text-xs text-gray-400 mt-1">
          <span>Base {formatPrice(flight.base_price)}</span>
          {(seat.extra_fee ?? 0) > 0 && <span>+ Seat fee {formatPrice(seat.extra_fee ?? 0)}</span>}
        </div>
      </div>

      {/* Global error */}
      {globalError && (
        <div className="flex items-start gap-2 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
          <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 shrink-0" />
          <p className="text-sm text-red-600">{globalError}</p>
        </div>
      )}

      {/* Full name */}
      <div>
        <label className={labelClass}>
          <User className="w-3.5 h-3.5" /> Full Name
        </label>
        <input
          suppressHydrationWarning
          type="text"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          placeholder="As it appears on your passport"
          className={inputClass(!!fieldErrors['fullName']?.length)}
          required
        />
        <FieldError field="fullName" />
      </div>

      {/* Passport number */}
      <div>
        <label className={labelClass}>
          <CreditCard className="w-3.5 h-3.5" /> Passport Number
        </label>
        <input
          suppressHydrationWarning
          type="text"
          value={passportNo}
          onChange={(e) => setPassportNo(e.target.value.toUpperCase())}
          placeholder="e.g. P1234567"
          autoComplete="off"
          className={inputClass(!!fieldErrors['passportNo']?.length)}
          required
        />
        <FieldError field="passportNo" />
        <p className="mt-1 text-xs text-gray-400">
          Your passport number is not stored locally for security.
        </p>
      </div>

      {/* Nationality */}
      <div>
        <label className={labelClass}>
          <Globe className="w-3.5 h-3.5" /> Nationality
        </label>
        <input
          suppressHydrationWarning
          type="text"
          value={nationality}
          onChange={(e) => setNationality(e.target.value)}
          placeholder="e.g. Indian"
          className={inputClass(!!fieldErrors['nationality']?.length)}
          required
        />
        <FieldError field="nationality" />
      </div>

      {/* Date of Birth */}
      <div>
        <label className={labelClass}>
          <Calendar className="w-3.5 h-3.5" /> Date of Birth
        </label>
        <input
          suppressHydrationWarning
          type="date"
          value={dob}
          onChange={(e) => setDob(e.target.value)}
          max={new Date().toISOString().split('T')[0]}
          className={inputClass(!!fieldErrors['dob']?.length)}
          required
        />
        <FieldError field="dob" />
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-3 pt-2">
        <button
          suppressHydrationWarning
          type="button"
          onClick={() => router.back()}
          className="flex items-center justify-center gap-2 border border-gray-200 text-gray-600 hover:bg-gray-50 font-medium px-5 py-3 rounded-xl transition-colors text-sm"
        >
          <ArrowLeft className="w-4 h-4" /> Back
        </button>

        <button
          suppressHydrationWarning
          type="submit"
          disabled={loading}
          className={cn(
            'flex-1 font-semibold px-5 py-3 rounded-xl transition-colors text-sm text-white',
            loading
              ? 'bg-blue-400 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700 active:bg-blue-800'
          )}
        >
          {loading ? 'Confirming booking...' : `Confirm Booking · ${formatPrice(totalPrice)}`}
        </button>
      </div>
    </form>
  )
}
