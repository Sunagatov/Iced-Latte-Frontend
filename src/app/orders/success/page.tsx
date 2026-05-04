import { Suspense } from 'react'
import { redirect } from 'next/navigation'
import OrderSuccess from '@/features/orders/components/OrderSuccess'
import { requireRecoverableSession } from '@/shared/auth/guards'
import Loader from '@/shared/ui/Loader'

interface OrderSuccessPageProps {
  searchParams: Promise<{ sessionId?: string }>
}

export default async function OrderSuccessPage({
  searchParams,
}: Readonly<OrderSuccessPageProps>) {
  const { sessionId } = await searchParams

  if (!sessionId) {
    redirect('/orders')
  }

  await requireRecoverableSession(`/orders/success?sessionId=${sessionId}`)

  return (
    <Suspense fallback={<Loader />}>
      <OrderSuccess />
    </Suspense>
  )
}
