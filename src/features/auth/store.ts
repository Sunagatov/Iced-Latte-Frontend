import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { UserData } from '@/features/user/types'

interface AuthStore {
  token: string | null
  refreshToken: string | null
  isLoggedIn: boolean
  isRegistrationButtonDisabled: boolean
  userData: UserData | null
  authenticate: (token: string | null) => void
  setRefreshToken: (refreshToken: string) => void
  reset: () => void
  setRegistrationButtonDisabled: (disabled: boolean) => void
  setUserData: (userData: UserData | null) => void
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      token: null,
      refreshToken: null,
      isLoggedIn: false,
      isRegistrationButtonDisabled: false,
      userData: null,
      authenticate: (token) => set({ token, isLoggedIn: true }),
      setRefreshToken: (refreshToken) => set({ refreshToken, isLoggedIn: true }),
      reset: () => set({ token: null, refreshToken: null, userData: null, isLoggedIn: false }),
      setRegistrationButtonDisabled: (disabled) => set({ isRegistrationButtonDisabled: disabled }),
      setUserData: (userData) => set({ userData }),
    }),
    { name: 'token' },
  ),
)
