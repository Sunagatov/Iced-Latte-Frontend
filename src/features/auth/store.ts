import { create } from 'zustand'
import type { UserData } from '@/features/user/types'
import {
  setClientAuthStatus,
  type AuthStatus,
} from '@/shared/auth/sessionStatus'

export type { AuthStatus }
export const accountIdentity = (user: UserData | null | undefined) =>
  user?.id ?? user?.email ?? null

export interface AuthStore {
  profileGeneration: number
  profileWrite: () => () => void
  accountVersion: number
  sessionVersion: number
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
  profileGeneration: 0,
  profileWrite: () => {
    set((state) => ({ profileGeneration: state.profileGeneration + 1 }))

    return () =>
      set((state) => ({ profileGeneration: state.profileGeneration + 1 }))
  },
  accountVersion: 0,
  sessionVersion: 0,
  bootstrapError: null,
  setBootstrapError: (message) => set({ bootstrapError: message }),
  status: 'loading',
  userData: null,
  isLoggedIn: false,
  setAuthenticated: (userData) => {
    setClientAuthStatus('authenticated')
    set((state) => ({
      accountVersion:
        state.accountVersion +
        (state.status !== 'authenticated' ||
        accountIdentity(state.userData) !== accountIdentity(userData)
          ? 1
          : 0),
      sessionVersion: state.sessionVersion + 1,
      status: 'authenticated',
      isLoggedIn: true,
      userData:
        accountIdentity(state.userData) === accountIdentity(userData) &&
        (state.userData?.profileRevision ?? 0) >
          (userData?.profileRevision ?? 0)
          ? state.userData
          : userData,
      bootstrapError: null,
    }))
  },
  setAnonymous: () => {
    setClientAuthStatus('anonymous')
    set((state) => ({
      accountVersion: state.accountVersion + 1,
      sessionVersion: state.sessionVersion + 1,
      status: 'anonymous',
      isLoggedIn: false,
      userData: null,
      bootstrapError: null,
    }))
  },
  setLoading: () => {
    setClientAuthStatus('loading')
    set((state) => ({
      accountVersion: state.accountVersion + 1,
      sessionVersion: state.sessionVersion + 1,
      status: 'loading',
      bootstrapError: null,
    }))
  },
  reset: () => {
    setClientAuthStatus('anonymous')
    set((state) => ({
      accountVersion: state.accountVersion + 1,
      sessionVersion: state.sessionVersion + 1,
      status: 'anonymous',
      isLoggedIn: false,
      userData: null,
      bootstrapError: null,
    }))
  },
  setUserData: (userData) =>
    set((state) =>
      state.status === 'authenticated' &&
      accountIdentity(userData) === accountIdentity(state.userData) &&
      (userData?.profileRevision ?? 0) >= (state.userData?.profileRevision ?? 0)
        ? { userData, profileGeneration: state.profileGeneration + 1 }
        : {},
    ),
}))
