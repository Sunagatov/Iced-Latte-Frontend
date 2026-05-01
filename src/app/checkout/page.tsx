import CheckoutForm from '@/features/checkout/components/CheckoutForm'
import { requireRecoverableSession } from '@/shared/auth/guards'

export default async function CheckoutPage() {
  await requireRecoverableSession('/checkout')

  return <CheckoutForm />
}
