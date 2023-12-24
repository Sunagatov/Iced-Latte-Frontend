import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface AuthStore {
  token: string | null
  isLoggedIn: boolean
  authenticate: (token: string) => void
  reset: () => void
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      token: null,
      isLoggedIn: false,
      authenticate: (token: string) => set({ token: token, isLoggedIn: true }),
      reset: () => set({ token: '', isLoggedIn: false }),
    }),
    {
      name: 'token',
    },
  ),
)
