'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { useAuthStore } from '@/features/auth/public'
import { accountIdentity } from '@/features/auth/store'
import { startResourceUpdates } from './resourceUpdates'
import { sessionChangeType } from './sessionEvents'
import { clearReviewDrafts } from '@/features/reviews/reviewDrafts'
import {
  bootstrapClientSession,
  onSessionStoresHydrated,
  syncSessionStores,
  resetSessionStores,
} from '@/features/session/session'

const OAUTH_CALLBACK_PATHS = new Set([
  '/auth/google/callback',
  '/auth/github/callback',
])

export function useSessionBootstrap(): void {
  const status = useAuthStore((s) => s.status)
  const account = useAuthStore((s) => accountIdentity(s.userData))
  const pathname = usePathname()
  const shouldSkipBootstrap = OAUTH_CALLBACK_PATHS.has(pathname)

  useEffect(() => {
    if (shouldSkipBootstrap) return
    const receiveSessionChange = (event: StorageEvent) => {
      const type = sessionChangeType(event)

      if (!type) return
      // The originating tab already changed the shared cookies. Never clear
      // cookies here: a delayed notification must not destroy a newer login.
      useAuthStore.getState().reset()
      resetSessionStores()
      if (type === 'logout') clearReviewDrafts()
      else {
        useAuthStore.getState().setLoading()
        void bootstrapClientSession()
      }
    }

    window.addEventListener('storage', receiveSessionChange)

    return () => window.removeEventListener('storage', receiveSessionChange)
  }, [shouldSkipBootstrap])

  useEffect(
    () =>
      useAuthStore.subscribe((state, previous) => {
        const oldAccount = accountIdentity(previous.userData)
        const newAccount = accountIdentity(state.userData)

        if (oldAccount !== newAccount) {
          // Keep genuine guest choices on sign-in, but never carry account data
          // into a different account. Reset also invalidates in-flight responses.
          resetSessionStores(oldAccount === null && newAccount !== null)
        }
      }),
    [],
  )

  useEffect(() => {
    if (shouldSkipBootstrap || status !== 'authenticated') return

    return startResourceUpdates()
  }, [status, account, shouldSkipBootstrap])

  useEffect(() => {
    if (shouldSkipBootstrap) return

    void bootstrapClientSession()
  }, [shouldSkipBootstrap])

  useEffect(() => {
    if (shouldSkipBootstrap) return

    const controller = new AbortController()
    const unsubscribe = onSessionStoresHydrated(() => {
      void syncSessionStores(status, controller.signal)
    })

    return () => {
      controller.abort()
      unsubscribe()
    }
  }, [status, account, shouldSkipBootstrap])
}
