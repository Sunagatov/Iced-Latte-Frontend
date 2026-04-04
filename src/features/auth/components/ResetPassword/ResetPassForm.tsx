'use client'

import AuthResetPassForm from './AuthResetPassForm'
import GuestResetPassForm from './GuestResetPassForm'
import { useAuthStore } from '@/features/auth/store'

export default function ResetPassForm() {
  const status: string = useAuthStore((state) => state.status)

  if (status === 'loading') return null

  return status === 'authenticated' ? <AuthResetPassForm /> : <GuestResetPassForm />
}
