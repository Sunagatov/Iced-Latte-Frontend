import OrderHistory from '@/features/orders/components/OrderHistory'
import Loader from '@/shared/ui/Loader/Loader'
import { getCookie, getRefreshCookie } from '@/shared/auth/cookies'
import { hasRecoverableSession } from '@/shared/auth/token'
import { redirect } from 'next/navigation'
import { Suspense } from 'react'

export default async function OrdersPage() {
  const token = await getCookie()
  const refreshToken = await getRefreshCookie()

  if (!hasRecoverableSession(token, refreshToken)) {
    redirect('/signin?next=/orders')
  }

  return (
    <Suspense
      fallback={
        <div className="flex min-h-[50vh] items-center justify-center">
          <Loader />
        </div>
      }
    >
      <OrderHistory />
    </Suspense>
  )
}
