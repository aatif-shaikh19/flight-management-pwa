'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useUserStore } from '@/stores/useUserStore'
import { useFlightStore } from '@/stores/useFlightStore'
import { Plane } from 'lucide-react'

export function Navbar() {
  const router = useRouter()
  const { user, setSession, setUser, reset: resetUserStore } = useUserStore()
  const { reset: resetFlightStore } = useFlightStore()

  useEffect(() => {
    const supabase = createClient()

    // Sync current session into store on mount
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setUser(session?.user ?? null)
    })

    // Keep store in sync with auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session)
        setUser(session?.user ?? null)
      }
    )

    return () => subscription.unsubscribe()
  }, [setSession, setUser])

  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()

    // Reset BOTH stores on logout — clears all persisted data
    resetUserStore()
    resetFlightStore()

    router.push('/')
    router.refresh()
  }

  return (
    <nav className="border-b border-gray-200 bg-white sticky top-0 z-30">
      <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
        <a href="/" className="flex items-center gap-2 font-bold text-gray-900">
          <Plane className="w-5 h-5 text-blue-600" />
          SkyBook
        </a>

        <div className="flex items-center gap-3">
          {user ? (
            <>
              <span className="text-xs text-gray-400 hidden sm:block truncate max-w-[160px]">
                {user.email}
              </span>
              
              <a
                href="/bookings"
                className="text-sm text-gray-600 hover:text-gray-900 font-medium"
              >
                My Bookings
              </a>
              <button
                onClick={handleLogout}
                className="text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium px-3 py-1.5 rounded-lg transition-colors"
              >
                Sign Out
              </button>
            </>
          ) : (
            <>
              <a
                href="/login"
                className="text-sm text-gray-600 hover:text-gray-900 font-medium"
              >
                Sign In
              </a>
              
              <a
                href="/signup"
                className="text-sm bg-blue-600 hover:bg-blue-700 text-white font-medium px-3 py-1.5 rounded-lg transition-colors"
              >
                Sign Up
              </a>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}
