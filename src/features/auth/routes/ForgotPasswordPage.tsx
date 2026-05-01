import ForgotPassForm from '@/features/auth/components/ResetPassword/ForgotPassForm'
import { Suspense } from 'react'

export default function ForgotPasswordPage() {
  return (
    <Suspense>
      <ForgotPassForm />
    </Suspense>
  )
}
