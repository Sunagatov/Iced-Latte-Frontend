'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { useAuthStore } from '@/features/auth/store'
import {
  bootstrapClientSession,
  onSessionStoresHydrated,
  syncSessionStores,
} from '@/features/session/session'

export function useSessionBootstrap(): void {
  const status = useAuthStore((s) => s.status)
  const pathname = usePathname()
  const shouldSkipBootstrap = pathname === '/auth/google/callback'

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
