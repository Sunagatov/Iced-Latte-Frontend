import { redirect } from 'next/navigation'
import { requireRecoverableSession } from '@/shared/auth/guards'
import { CheckoutSuccess } from '@/features/payment/CheckoutSuccess'

interface Props {
  searchParams: Promise<{ session_id?: string; order_id?: string }>
}

export default async function CheckoutSuccessPage({ searchParams }: Props) {
  await requireRecoverableSession('/checkout')

  const params = await searchParams
  const orderId = params.order_id

  if (!orderId) {
    redirect('/orders')
  }

  return <CheckoutSuccess orderId={orderId} />
}
