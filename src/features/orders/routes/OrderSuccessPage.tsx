import OrderSuccess from '@/features/orders/components/OrderSuccess'
import Loader from '@/shared/ui/Loader/Loader'
import { getCookie, getRefreshCookie } from '@/shared/auth/cookies'
import { hasRecoverableSession } from '@/shared/auth/token'
import { redirect } from 'next/navigation'
import { Suspense } from 'react'

interface OrderSuccessPageProps {
  searchParams: Promise<{ sessionId?: string }>
}

export default async function OrderSuccessPage({
  searchParams,
}: Readonly<OrderSuccessPageProps>) {
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
