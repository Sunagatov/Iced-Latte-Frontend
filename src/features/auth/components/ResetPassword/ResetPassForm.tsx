'use client'

import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import AuthResetPassForm from './AuthResetPassForm'
import GuestResetPassForm from './GuestResetPassForm'
import { useAuthStore } from '@/features/auth/store'

export default function ResetPassForm() {
  const router = useRouter()
  const status = useAuthStore((state) => state.status)
  const userData = useAuthStore((state) => state.userData)

  useEffect(() => {
    if (status === 'authenticated' && userData?.oauthUser) {
      const params = new URLSearchParams({ email: userData.email })

      router.replace(`/forgotpass?${params}`)
    }
  }, [status, userData, router])

  if (status === 'loading') {
    return null
  }

  if (status === 'authenticated' && userData?.oauthUser) {
    return null
  }

  return status === 'authenticated' ? (
    <AuthResetPassForm />
  ) : (
    <GuestResetPassForm />
  )
}
