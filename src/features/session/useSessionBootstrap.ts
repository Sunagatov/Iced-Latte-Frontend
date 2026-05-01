'use client'

import { useEffect } from 'react'
import { useAuthStore } from '@/features/auth/store'
import {
  applySessionResolution,
  resolveSession,
} from '@/features/session/sessionAuth'
import {
  onSessionStoresHydrated,
  syncSessionState,
} from '@/features/session/sessionSync'

export function useSessionBootstrap(): void {
  const status = useAuthStore((s) => s.status)

  useEffect(() => {
    let cancelled = false

    const bootstrapSession = async (): Promise<void> => {
      const pathname =
        typeof window !== 'undefined' ? window.location.pathname : undefined
      const resolution = await resolveSession(pathname)

      if (!cancelled) {
        applySessionResolution(resolution)
      }
    }

    void bootstrapSession()

    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    const controller = new AbortController()
    const unsubscribe = onSessionStoresHydrated(() => {
      void syncSessionState(status, controller.signal)
    })

    return () => {
      controller.abort()
      unsubscribe()
    }
  }, [status])
}
