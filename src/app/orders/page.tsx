import { Suspense } from 'react'
import OrderHistory from '@/components/OrderHistory/OrderHistory'
import Loader from '@/components/UI/Loader/Loader'

export default function OrdersPage() {
  return (
    <Suspense fallback={<div className="flex min-h-[50vh] items-center justify-center"><Loader /></div>}>
      <OrderHistory />
    </Suspense>
  )
}
