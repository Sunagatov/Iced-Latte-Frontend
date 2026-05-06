import Link from 'next/link'
import { ROUTES } from '@/shared/config/routes'
import { requireRecoverableSession } from '@/shared/auth/guards'

export default async function CheckoutCancelPage() {
  await requireRecoverableSession(ROUTES.checkout)

  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4">
      <div className="text-4xl">🛒</div>
      <h1 className="text-2xl font-bold">Payment cancelled</h1>
      <p className="text-gray-600">
        Your cart is still intact — no payment was made.
      </p>
      <p className="text-sm text-gray-400">
        This is a test payment flow — no real money is ever charged.
      </p>
      <div className="mt-4 flex gap-4">
        <Link
          href={ROUTES.checkout}
          className="rounded-lg bg-black px-6 py-3 text-white hover:bg-gray-800"
        >
          Try again
        </Link>
        <Link
          href={ROUTES.cart}
          className="rounded-lg border border-gray-300 px-6 py-3 hover:bg-gray-50"
        >
          Back to cart
        </Link>
      </div>
    </div>
  )
}
