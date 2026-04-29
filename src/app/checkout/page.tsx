import CheckoutForm from '@/features/checkout/components/CheckoutForm'
import { redirect } from 'next/navigation'
import { getCookie, getRefreshCookie } from '@/shared/utils/cookieUtils'
import { hasRecoverableSession } from '@/shared/utils/authToken'

export default async function Checkout() {
  const token = await getCookie()
  const refreshToken = await getRefreshCookie()

  if (!hasRecoverableSession(token, refreshToken)) {
    redirect('/signin?next=/checkout')
  }

  return <CheckoutForm />
}
