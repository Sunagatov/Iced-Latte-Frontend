'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { useAuthStore } from '@/features/auth/public'
import {
  bootstrapClientSession,
  onSessionStoresHydrated,
  syncSessionStores,
} from '@/features/session/session'

const OAUTH_CALLBACK_PATHS = new Set([
  '/auth/google/callback',
  '/auth/github/callback',
])

export function useSessionBootstrap(): void {
  const status = useAuthStore((s) => s.status)
  const pathname = usePathname()
  const shouldSkipBootstrap = OAUTH_CALLBACK_PATHS.has(pathname)

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
  }, [status, shouldSkipBootstrap])
}
