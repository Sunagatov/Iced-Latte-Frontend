import CheckoutForm from '@/features/checkout/components/CheckoutForm'
import { getCookie, getRefreshCookie } from '@/shared/auth/cookies'
import { hasRecoverableSession } from '@/shared/auth/token'
import { redirect } from 'next/navigation'

export default async function CheckoutPage() {
  const token = await getCookie()
  const refreshToken = await getRefreshCookie()

  if (!hasRecoverableSession(token, refreshToken)) {
    redirect('/signin?next=/checkout')
  }

  return <CheckoutForm />
}
