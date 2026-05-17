import { Suspense } from 'react'
import OrderHistory from '@/features/orders/components/OrderHistory'
import { requireRecoverableSession } from '@/shared/auth/guards'
import { ROUTES } from '@/shared/config/routes'
import Loader from '@/shared/ui/Loader'

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
