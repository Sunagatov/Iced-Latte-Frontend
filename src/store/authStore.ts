import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface AuthStore {
  token: string | null
  authenticate: (token: string) => void
  reset: () => void
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      token: null,
      authenticate: (token: string) => set({ token: token }),
      reset: () => set({ token: '' }),
    }),
    {
      name: 'token',
    },
  ),
)
