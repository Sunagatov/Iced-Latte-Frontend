import { Suspense } from 'react'
import ForgotPassForm from '@/features/auth/components/ResetPassword/ForgotPassForm'

export default function ForgotPass() {
  return (
    <Suspense>
      <ForgotPassForm />
    </Suspense>
  )
}
