import { Suspense } from 'react'
import OrdersForm from '@/shared/components/Orders/Orders'
import Loader from '@/shared/components/Loader/Loader'

export default function Orders() {
  return (
    <Suspense fallback={<Loader />}>
      <OrdersForm />
    </Suspense>
  )
}
