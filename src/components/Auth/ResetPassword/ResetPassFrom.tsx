'use client'

import { useAuthStore } from '@/store/authStore'
import AuthResetPassForm from './AuthResetPassForm'
import GuestResetPassForm from './GuestResetPassForm'

export default function ResetPass() {
  const { isLoggedIn } = useAuthStore()

  return (
    <>
      {isLoggedIn}? <AuthResetPassForm /> : <GuestResetPassForm />
    </>
  )
}