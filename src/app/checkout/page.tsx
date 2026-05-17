import CheckoutForm from '@/features/checkout/components/CheckoutForm'
import { ROUTES } from '@/shared/config/routes'
import { requireRecoverableSession } from '@/shared/auth/guards'

export default async function CheckoutPage() {
  await requireRecoverableSession(ROUTES.checkout)

  return <CheckoutForm />
}
