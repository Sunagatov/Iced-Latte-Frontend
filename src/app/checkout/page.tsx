import type { Metadata } from 'next'
import CheckoutForm from '@/features/checkout/components/CheckoutForm'
import { ROUTES } from '@/shared/config/routes'
import { requireRecoverableSession } from '@/shared/auth/guards'

export const dynamic = 'force-dynamic'
export const metadata: Metadata = {
  title: 'Checkout',
  description: 'Complete your Iced Latte order securely.',
}

export default async function CheckoutPage() {
  await requireRecoverableSession(ROUTES.checkout)

  return <CheckoutForm />
}
