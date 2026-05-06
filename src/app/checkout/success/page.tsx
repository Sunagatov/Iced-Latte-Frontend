import { redirect } from 'next/navigation'
import { ROUTES } from '@/shared/config/routes'
import { requireRecoverableSession } from '@/shared/auth/guards'
import { CheckoutSuccess } from '@/features/payment/CheckoutSuccess'

interface Props {
  searchParams: Promise<{ session_id?: string; order_id?: string }>
}

export default async function CheckoutSuccessPage({ searchParams }: Props) {
  await requireRecoverableSession(ROUTES.checkout)

  const params = await searchParams
  const orderId = params.order_id

  if (!orderId) {
    redirect(ROUTES.orders)
  }

  return <CheckoutSuccess orderId={orderId} />
}
