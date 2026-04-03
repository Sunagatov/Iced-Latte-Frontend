'use client'

import AuthResetPassForm from './AuthResetPassForm'
import GuestResetPassForm from './GuestResetPassForm'
import { useAuthStore } from '@/features/auth/store'
import { useEffect, useState } from 'react'

interface PersistApi { persist: { hasHydrated: () => boolean; onFinishHydration: (cb: () => void) => () => void } }
const authPersist = (useAuthStore as unknown as PersistApi).persist

export default function ResetPassForm() {
  const isLoggedIn = useAuthStore((state) => state.isLoggedIn)
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    if (authPersist.hasHydrated()) {
      setHydrated(true)

      return
    }

    const unsub = authPersist.onFinishHydration(() => setHydrated(true))

    return unsub
  }, [])

  const hydratedState = typeof window === 'undefined' ? false : (authPersist.hasHydrated() || hydrated)

  if (!hydratedState) return null

  return (
    <>
      {isLoggedIn ? <AuthResetPassForm /> : <GuestResetPassForm />}
    </>
  )
}
