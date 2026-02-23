import { Suspense } from 'react'
import OrdersForm from '@/components/Orders/Orders'
import Loader from '@/components/UI/Loader/Loader'

export default function Orders() {
  return (
    <Suspense fallback={<Loader />}>
      <OrdersForm />
    </Suspense>
  )
}
