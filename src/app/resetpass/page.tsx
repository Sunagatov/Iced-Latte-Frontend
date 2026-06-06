import { Suspense } from 'react'
import ResetPassForm from '@/features/auth/components/ResetPassword/ResetPassForm'
import Loader from '@/shared/ui/Loader'

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[50vh] items-center justify-center">
          <Loader />
        </div>
      }
    >
      <ResetPassForm />
    </Suspense>
  )
}
