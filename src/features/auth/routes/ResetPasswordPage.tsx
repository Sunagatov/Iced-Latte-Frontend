import ResetPassForm from '@/features/auth/components/ResetPassword/ResetPassForm'
import { Suspense } from 'react'

export default function ResetPasswordPage() {
  return (
    <Suspense>
      <ResetPassForm />
    </Suspense>
  )
}
