import { redirect } from 'next/navigation'
import { ROUTES } from '@/shared/config/routes'
import { requireRecoverableSession } from '@/shared/auth/guards'
import { CheckoutSuccess } from '@/features/payment/CheckoutSuccess'

type SearchParamValue = string | string[] | undefined

interface Props {
  searchParams: Promise<Record<string, SearchParamValue>>
}

function getSingleSearchParam(value: SearchParamValue): string | null {
  if (typeof value !== 'string') {
    return null
  }

  const trimmed = value.trim()

  return trimmed || null
}

export default async function CheckoutSuccessPage({ searchParams }: Props) {
  await requireRecoverableSession(ROUTES.checkout)

  const params = await searchParams
  const orderId = getSingleSearchParam(params.order_id)

  if (!orderId) {
    redirect(ROUTES.orders)
  }

  return <CheckoutSuccess orderId={orderId} />
}
