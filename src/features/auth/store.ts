import { create } from 'zustand'
import { UserData } from '@/features/user/types'

export type AuthStatus = 'loading' | 'anonymous' | 'authenticated'

export interface AuthStore {
  status: AuthStatus
  userData: UserData | null
  isLoggedIn: boolean
  // Set to true by OAuth callback pages to prevent bootstrap from firing a
  // stale refresh before the new session cookies have been consumed.
  skipBootstrapRefresh: boolean
  setAuthenticated: (userData: UserData | null) => void
  setAnonymous: () => void
  setLoading: () => void
  reset: () => void
  setUserData: (userData: UserData | null) => void
  setSkipBootstrapRefresh: (skip: boolean) => void
}

export const useAuthStore = create<AuthStore>()((set) => ({
  status: 'loading',
  userData: null,
  isLoggedIn: false,
  skipBootstrapRefresh: false,
  setAuthenticated: (userData) => set({ status: 'authenticated', isLoggedIn: true, userData }),
  setAnonymous: () => set({ status: 'anonymous', isLoggedIn: false, userData: null }),
  setLoading: () => set({ status: 'loading' }),
  reset: () => set({ status: 'anonymous', isLoggedIn: false, userData: null }),
  setUserData: (userData) => set({ userData }),
  setSkipBootstrapRefresh: (skip) => set({ skipBootstrapRefresh: skip }),
}))
