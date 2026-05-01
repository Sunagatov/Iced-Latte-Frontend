'use client'

import { useEffect } from 'react'
import { useAuthStore } from '@/features/auth/store'
import {
  bootstrapClientSession,
  onSessionStoresHydrated,
  syncSessionStores,
} from '@/features/session/session'

export function useSessionBootstrap(): void {
  const status = useAuthStore((s) => s.status)

  useEffect(() => {
    void bootstrapClientSession()
  }, [])

  useEffect(() => {
    const controller = new AbortController()
    const unsubscribe = onSessionStoresHydrated(() => {
      void syncSessionStores(status, controller.signal)
    })

    return () => {
      controller.abort()
      unsubscribe()
    }
  }, [status])
}
