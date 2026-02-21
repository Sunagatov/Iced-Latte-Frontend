'use client'

import AuthResetPassForm from './AuthResetPassForm'
import GuestResetPassForm from './GuestResetPassForm'
import { useAuthStore } from '@/store/authStore'

export default function ResetPassForm() {
  const isLoggedIn = useAuthStore((state) => state.isLoggedIn)

  return (
    <>
      {isLoggedIn ? <AuthResetPassForm /> : <GuestResetPassForm />}
    </>
  )
}