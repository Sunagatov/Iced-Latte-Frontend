'use client'

import AuthResetPassForm from './AuthResetPassForm'
import GuestResetPassForm from './GuestResetPassForm'
import { useAuthStore } from '@/features/auth/store'
import { useEffect, useState } from 'react'

interface PersistApi { persist: { hasHydrated: () => boolean; onFinishHydration: (fn: () => void) => () => void } }
const authPersist = (useAuthStore as unknown as PersistApi).persist

export default function ResetPassForm() {
  const isLoggedIn = useAuthStore((state) => state.isLoggedIn)
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    const unsub = authPersist.onFinishHydration(() => { setHydrated(true) })
    if (authPersist.hasHydrated()) setHydrated(true)
    return unsub
  }, [])

  if (!hydrated) return null

  return (
    <>
      {isLoggedIn ? <AuthResetPassForm /> : <GuestResetPassForm />}
    </>
  )
}
