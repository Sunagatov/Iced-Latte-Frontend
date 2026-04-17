import { Suspense } from 'react'
import OrderSuccess from '@/features/orders/components/OrderSuccess'
import Loader from '@/shared/components/Loader/Loader'

export default function Orders() {
  return (
    <Suspense fallback={<Loader />}>
      <OrderSuccess />
    </Suspense>
  )
}
