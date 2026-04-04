import { create } from 'zustand'
import { UserData } from '@/features/user/types'

export type AuthStatus = 'loading' | 'anonymous' | 'authenticated'

export interface AuthStore {
  status: AuthStatus
  userData: UserData | null
  setAuthenticated: (userData: UserData | null) => void
  setAnonymous: () => void
  setLoading: () => void
  reset: () => void
  setUserData: (userData: UserData | null) => void
  // Legacy compat — components still reading isLoggedIn
  readonly isLoggedIn: boolean
}

export const useAuthStore = create<AuthStore>()((set, get) => ({
  status: 'loading',
  userData: null,
  get isLoggedIn() { return get().status === 'authenticated' },
  setAuthenticated: (userData) => set({ status: 'authenticated', userData }),
  setAnonymous: () => set({ status: 'anonymous', userData: null }),
  setLoading: () => set({ status: 'loading' }),
  reset: () => set({ status: 'anonymous', userData: null }),
  setUserData: (userData) => set({ userData }),
}))