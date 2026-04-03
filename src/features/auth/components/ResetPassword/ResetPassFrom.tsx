'use client'

import AuthResetPassForm from './AuthResetPassForm'
import GuestResetPassForm from './GuestResetPassForm'
import { useAuthStore } from '@/features/auth/store'
import { useEffect, useState } from 'react'

interface PersistStore { persist: { hasHydrated: () => boolean; onFinishHydration: (fn: () => void) => () => void } }

export default function ResetPassForm() {
  const isLoggedIn = useAuthStore((state) => state.isLoggedIn)
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    const persist = (useAuthStore as unknown as PersistStore).persist

    if (persist.hasHydrated()) {
      setHydrated(true)

      return
    }

    return persist.onFinishHydration(() => { setHydrated(true) })
  }, [])

  if (!hydrated) return null

  return isLoggedIn ? <AuthResetPassForm /> : <GuestResetPassForm />
}
