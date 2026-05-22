'use client'

import { useEffect } from 'react'
import { useFlightStore } from '@/stores/useFlightStore'

export function StoreResetOnBookingComplete() {
  const resetBookingFlow = useFlightStore((state) => state.resetBookingFlow)

  useEffect(() => {
    // Clear in-progress booking state once confirmation is shown
    resetBookingFlow()
  }, [resetBookingFlow])

  return null
}
