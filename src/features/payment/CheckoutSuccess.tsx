'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useCartStore } from '@/features/cart/cartStore'
import { getCheckoutStatus } from '@/features/payment/public'

const MAX_RETRIES = 5
const POLL_INTERVAL_MS = 2000

export function CheckoutSuccess({ orderId }: { orderId: string }) {
  const { resetCart } = useCartStore()
  const [status, setStatus] = useState<'loading' | 'paid' | 'pending' | 'error'>('loading')
  const [retries, setRetries] = useState(0)

  useEffect(() => {
    const controller = new AbortController()

    async function poll() {
      try {
        const result = await getCheckoutStatus(orderId, controller.signal)

        if (result.orderStatus === 'PAID') {
          setStatus('paid')
          resetCart()

          return
        }

        if (result.orderStatus === 'PENDING_PAYMENT' && retries < MAX_RETRIES) {
          setTimeout(() => setRetries((r) => r + 1), POLL_INTERVAL_MS)

          return
        }

        setStatus('pending')
      } catch {
        if (!controller.signal.aborted) {
          setStatus('error')
        }
      }
    }

    poll()

    return () => controller.abort()
  }, [orderId, retries, resetCart])

  if (status === 'loading') {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-black" />
        <p className="text-lg">Confirming your payment…</p>
        <p className="text-sm text-gray-500">
          Test payment only — no real money is charged.
        </p>
      </div>
    )
  }

  if (status === 'paid') {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4">
        <div className="text-4xl">✅</div>
        <h1 className="text-2xl font-bold">Payment confirmed!</h1>
        <p className="text-gray-600">Your order has been placed successfully.</p>
        <p className="text-sm text-gray-400">
          This was a test payment — no real money was charged.
        </p>
        <Link
          href="/orders"
          className="mt-4 rounded-lg bg-black px-6 py-3 text-white hover:bg-gray-800"
        >
          View your orders
        </Link>
      </div>
    )
  }

  if (status === 'error') {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4">
        <div className="text-4xl">⚠️</div>
        <h1 className="text-xl font-bold">Something went wrong</h1>
        <p className="text-gray-600">
          We couldn&apos;t confirm your payment status. Please check your orders.
        </p>
        <Link
          href="/orders"
          className="mt-4 rounded-lg bg-black px-6 py-3 text-white hover:bg-gray-800"
        >
          View your orders
        </Link>
      </div>
    )
  }

  // status === 'pending'
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4">
      <div className="text-4xl">⏳</div>
      <h1 className="text-xl font-bold">Payment not yet confirmed</h1>
      <p className="text-gray-600">
        Your payment is still being processed. Check back in a moment.
      </p>
      <Link
        href="/orders"
        className="mt-4 rounded-lg bg-black px-6 py-3 text-white hover:bg-gray-800"
      >
        View your orders
      </Link>
    </div>
  )
}
