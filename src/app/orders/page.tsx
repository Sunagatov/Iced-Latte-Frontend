import { Suspense } from 'react'
import OrderHistory from '@/features/orders/components/OrderHistory'
import Loader from '@/shared/components/Loader/Loader'
import { redirect } from 'next/navigation'
import { getCookie, getRefreshCookie } from '@/shared/utils/cookieUtils'
import { hasRecoverableSession } from '@/shared/utils/authToken'

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
