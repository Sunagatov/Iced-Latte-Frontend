'use client'

import AuthResetPassForm from './AuthResetPassForm'
import GuestResetPassForm from './GuestResetPassForm'
import { useAuthStore } from '@/features/auth/store'
import { useEffect, useState } from 'react'

export default function ResetPassForm() {
  const isLoggedIn = useAuthStore((state) => state.isLoggedIn)
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    const unsub = useAuthStore.persist.onFinishHydration(() => setHydrated(true))
    // If already hydrated by the time this effect runs, set immediately
    if (useAuthStore.persist.hasHydrated()) setHydrated(true)
    return unsub
  }, [])

  if (!hydrated) return null

  return (
    <>
      {isLoggedIn ? <AuthResetPassForm /> : <GuestResetPassForm />}
    </>
  )
}
