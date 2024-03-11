'use client'

import AuthResetPassForm from './AuthResetPassForm'
import GuestResetPassForm from './GuestResetPassForm'
import { useStoreData } from '@/hooks/useStoreData'
import { useAuthStore } from '@/store/authStore'

export default function ResetPassForm() {
  const isLoggedIn = useStoreData(
    useAuthStore,
    (state) => state.isLoggedIn,
  )

  return (
    <>
      {isLoggedIn ? <AuthResetPassForm /> : <GuestResetPassForm />}
    </>
  )
}