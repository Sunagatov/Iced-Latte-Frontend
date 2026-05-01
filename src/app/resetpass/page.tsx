import { Suspense } from 'react'
import ResetPassForm from '@/features/auth/components/ResetPassword/ResetPassForm'

export default function ResetPasswordPage() {
  return (
    <Suspense>
      <ResetPassForm />
    </Suspense>
  )
}
