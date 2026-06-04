'use client'

import { useRouter } from 'next/navigation'
import { ROUTES } from '@/shared/config/routes'
import { useEffect, useState } from 'react'
import AuthResetPassForm from './AuthResetPassForm'
import GuestResetPassForm from './GuestResetPassForm'
import { useAuthStore } from '@/features/auth/public'

export default function ResetPassForm() {
  const router = useRouter()
  const status = useAuthStore((state) => state.status)
  const userData = useAuthStore((state) => state.userData)
  const [passwordChanged, setPasswordChanged] = useState(false)

  useEffect(() => {
    if (!passwordChanged && status === 'authenticated' && userData?.oauthUser) {
      router.replace(ROUTES.forgotpass)
    }
  }, [status, userData?.oauthUser, router, passwordChanged])

  if (status === 'loading') {
    return null
  }

  if (!passwordChanged && status === 'authenticated' && userData?.oauthUser) {
    return null
  }

  if (passwordChanged) {
    return <AuthResetPassForm initialChangeSuccessful />
  }

  return status === 'authenticated' ? (
    <AuthResetPassForm onPasswordChanged={() => setPasswordChanged(true)} />
  ) : (
    <GuestResetPassForm />
  )
}
