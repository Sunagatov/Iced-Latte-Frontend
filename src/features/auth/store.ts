import { create } from 'zustand'
import type { UserData } from '@/features/user/types'
import {
  setClientAuthStatus,
  type AuthStatus,
} from '@/shared/auth/sessionStatus'

export type { AuthStatus }

export interface AuthStore {
  bootstrapError: string | null
  setBootstrapError: (message: string | null) => void
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
  bootstrapError: null,
  setBootstrapError: (message) => set({ bootstrapError: message }),
  status: 'loading',
  userData: null,
  isLoggedIn: false,
  setAuthenticated: (userData) => {
    setClientAuthStatus('authenticated')
    set({
      status: 'authenticated',
      isLoggedIn: true,
      userData,
      bootstrapError: null,
    })
  },
  setAnonymous: () => {
    setClientAuthStatus('anonymous')
    set({
      status: 'anonymous',
      isLoggedIn: false,
      userData: null,
      bootstrapError: null,
    })
  },
  setLoading: () => {
    setClientAuthStatus('loading')
    set({ status: 'loading', bootstrapError: null })
  },
  reset: () => {
    setClientAuthStatus('anonymous')
    set({
      status: 'anonymous',
      isLoggedIn: false,
      userData: null,
      bootstrapError: null,
    })
  },
  setUserData: (userData) => set({ userData }),
}))
