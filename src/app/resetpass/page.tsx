import { Suspense } from 'react'
import ResetPassForm from '@/features/auth/components/ResetPassword/ResetPassForm'

export default function ResetPass() {
  return (
    <Suspense>
      <ResetPassForm />
    </Suspense>
  )
}
