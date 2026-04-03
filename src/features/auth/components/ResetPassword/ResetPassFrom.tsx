'use client'

import AuthResetPassForm from './AuthResetPassForm'
import GuestResetPassForm from './GuestResetPassForm'
import { useAuthStore } from '@/features/auth/store'
import { useEffect, useState } from 'react'

export default function ResetPassForm() {
  const isLoggedIn = useAuthStore((state) => state.isLoggedIn)
  const [hydrated, setHydrated] = useState(() => useAuthStore.persist.hasHydrated())

  useEffect(() => {
    if (hydrated) return
    return useAuthStore.persist.onFinishHydration(() => setHydrated(true))
  }, [hydrated])

  if (!hydrated) return null

  return (
    <>
      {isLoggedIn ? <AuthResetPassForm /> : <GuestResetPassForm />}
    </>
  )
}