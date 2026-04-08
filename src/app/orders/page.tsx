import { Suspense } from 'react'
import OrderHistory from '@/shared/components/OrderHistory/OrderHistory'
import Loader from '@/shared/components/Loader/Loader'

export default function OrdersPage() {
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
