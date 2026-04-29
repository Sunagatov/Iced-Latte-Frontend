import { Suspense } from 'react'
import OrderSuccess from '@/features/orders/components/OrderSuccess'
import Loader from '@/shared/components/Loader/Loader'
import { redirect } from 'next/navigation'
import { getCookie, getRefreshCookie } from '@/shared/utils/cookieUtils'
import { hasRecoverableSession } from '@/shared/utils/authToken'

export default async function Orders({
  searchParams,
}: {
  searchParams: Promise<{ sessionId?: string }>
}) {
  const token = await getCookie()
  const refreshToken = await getRefreshCookie()
  const { sessionId } = await searchParams

  if (!sessionId) {
    redirect('/orders')
  }

  if (!hasRecoverableSession(token, refreshToken)) {
    redirect(
      `/signin?next=${encodeURIComponent(`/orders/success?sessionId=${sessionId}`)}`,
    )
  }

  return (
    <Suspense fallback={<Loader />}>
      <OrderSuccess />
    </Suspense>
  )
}
