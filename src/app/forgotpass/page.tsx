import { Suspense } from 'react'
import ForgotPassForm from '@/features/auth/components/ResetPassword/ForgotPassForm'

export default function ForgotPasswordPage() {
  return (
    <Suspense>
      <ForgotPassForm />
    </Suspense>
  )
}
