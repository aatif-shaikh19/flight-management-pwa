import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type { Session, User } from '@supabase/supabase-js'

type UserStore = {
  session: Session | null
  user: User | null
  setSession: (session: Session | null) => void
  setUser: (user: User | null) => void
  reset: () => void
}

export const useUserStore = create<UserStore>()(
  persist(
    (set) => ({
      session: null,
      user: null,
      setSession: (session) => set({ session }),
      setUser: (user) => set({ user }),
      reset: () => set({ session: null, user: null }),
    }),
    {
      name: 'user-store',
      storage: createJSONStorage(() => localStorage),
      // Only persist the access token — not the full session or user object
      partialize: (state) => ({
        session: state.session
          ? { access_token: state.session.access_token }
          : null,
      }),
    }
  )
)
