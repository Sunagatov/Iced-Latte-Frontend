import { create } from 'zustand'
import type { UserData } from '@/features/user/types'
import {
  setClientAuthStatus,
  type AuthStatus,
} from '@/shared/auth/sessionStatus'

export type { AuthStatus }

export interface AuthStore {
  status: AuthStatus
  userData: UserData | null
  isLoggedIn: boolean
  setAuthenticated: (userData: UserData | null) => void
  setAnonymous: () => void
  setLoading: () => void
  reset: () => void
  setUserData: (userData: UserData | null) => void
}

export const useAuthStore = create<AuthStore>()((set) => ({
  status: 'loading',
  userData: null,
  isLoggedIn: false,
  setAuthenticated: (userData) => {
    setClientAuthStatus('authenticated')
    set({ status: 'authenticated', isLoggedIn: true, userData })
  },
  setAnonymous: () => {
    setClientAuthStatus('anonymous')
    set({ status: 'anonymous', isLoggedIn: false, userData: null })
  },
  setLoading: () => {
    setClientAuthStatus('loading')
    set({ status: 'loading' })
  },
  reset: () => {
    setClientAuthStatus('anonymous')
    set({ status: 'anonymous', isLoggedIn: false, userData: null })
  },
  setUserData: (userData) => set({ userData }),
}))
