import type { Metadata } from 'next'
import { Suspense } from 'react'
import OrderHistory from '@/features/orders/components/OrderHistory'
import { requireRecoverableSession } from '@/shared/auth/guards'
import { ROUTES } from '@/shared/config/routes'
import Loader from '@/shared/ui/Loader'

export const dynamic = 'force-dynamic'
export const metadata: Metadata = {
  title: 'Orders',
  description: 'Track and review your Iced Latte orders.',
}

export default async function OrdersPage() {
  await requireRecoverableSession(ROUTES.orders)

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
