import { create } from 'zustand'
import { persist, createJSONStorage, devtools } from 'zustand/middleware'
import type { Session, User } from '@supabase/supabase-js'

type UserStore = {
  session: Session | null
  user:    User | null

  setSession: (session: Session | null) => void
  setUser:    (user: User | null) => void
  reset:      () => void
}

const INITIAL_STATE = {
  session: null,
  user:    null,
}

export const useUserStore = create<UserStore>()(
  devtools(
    persist(
      (set) => ({
        ...INITIAL_STATE,

        setSession: (session) =>
          set({ session }, false, 'setSession'),

        setUser: (user) =>
          set({ user }, false, 'setUser'),

        reset: () =>
          set(INITIAL_STATE, false, 'reset'),
      }),
      {
        name: 'user-store',
        storage: createJSONStorage(() => localStorage),
        // SECURITY: only persist the access token — not the full session or user object
        // Full user object is fetched fresh on every mount
        partialize: (state) => ({
          session: state.session
            ? { access_token: state.session.access_token }
            : null,
        }),
      }
    ),
    { name: 'UserStore' }
  )
)
