import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { UserData } from '@/features/user/types'

export interface AuthStore {
  token: string | null
  refreshToken: string | null
  isLoggedIn: boolean
  userData: UserData | null
  authenticate: (token: string | null) => void
  setRefreshToken: (refreshToken: string) => void
  reset: () => void
  setUserData: (userData: UserData | null) => void
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      token: null,
      refreshToken: null,
      isLoggedIn: false,
      userData: null,
      // Reject null/empty token — never mark user as logged-in without a real token
      authenticate: (token) => {
        if (!token) return
        set({ token, isLoggedIn: true })
      },
      setRefreshToken: (refreshToken) => set({ refreshToken, isLoggedIn: true }),
      reset: () => set({ token: null, refreshToken: null, userData: null, isLoggedIn: false }),
      setUserData: (userData) => set({ userData }),
    }),
    {
      name: 'token',
      // Only persist the access token — never persist refreshToken or PII (userData)
      partialize: (state) => ({ token: state.token, isLoggedIn: state.isLoggedIn }),
    },
  ),
)