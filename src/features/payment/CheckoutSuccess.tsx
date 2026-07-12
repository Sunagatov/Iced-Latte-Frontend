'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { useCartStore } from '@/features/cart/public'
import { getCheckoutStatus } from '@/features/payment/public'
import {
  buildGoogleAnalyticsItems,
  trackGoogleAnalyticsEvent,
} from '@/shared/analytics/googleAnalytics'
import { ROUTES } from '@/shared/config/routes'

const MAX_RETRIES = 5
const POLL_INTERVAL_MS = 2000
const FAILED_ORDER_STATUSES = new Set(['PAYMENT_FAILED', 'PAYMENT_EXPIRED'])
const FAILED_PAYMENT_STATUSES = new Set([
  'FAILED',
  'EXPIRED',
  'REFUNDED',
  'RECONCILIATION_FAILED',
])

export function CheckoutSuccess({ orderId }: { orderId: string }) {
  const { resetCart } = useCartStore()
  const cartItems = useCartStore((state) => state.tempItems)
  const totalPrice = useCartStore((state) => state.totalPrice)
  const cartStatus = useCartStore((state) => state.status)
  const [status, setStatus] = useState<
    'loading' | 'paid' | 'pending' | 'failed' | 'error'
  >('loading')
  const [retries, setRetries] = useState(0)
  const retryTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const purchaseTrackedOrderIdRef = useRef<string | null>(null)

  useEffect(() => {
    setStatus('loading')
    setRetries(0)
    purchaseTrackedOrderIdRef.current = null
  }, [orderId])

  useEffect(() => {
    const controller = new AbortController()

    if (retryTimerRef.current) {
      clearTimeout(retryTimerRef.current)
      retryTimerRef.current = null
    }

    async function poll() {
      try {
        const result = await getCheckoutStatus(orderId, controller.signal)

        if (result.orderStatus === 'PAID') {
          setStatus('paid')

          return
        }

        if (
          FAILED_ORDER_STATUSES.has(result.orderStatus) ||
          (result.paymentStatus && FAILED_PAYMENT_STATUSES.has(result.paymentStatus))
        ) {
          setStatus('failed')

          return
        }

        if (result.orderStatus === 'PENDING_PAYMENT' && retries < MAX_RETRIES) {
          retryTimerRef.current = setTimeout(() => {
            retryTimerRef.current = null
            setRetries((r) => r + 1)
          }, POLL_INTERVAL_MS)

          return
        }

        setStatus('pending')
      } catch {
        if (!controller.signal.aborted) {
          setStatus('error')
        }
      }
    }

    void poll()

    return () => controller.abort()
  }, [orderId, retries])

  useEffect(() => {
    if (status !== 'paid' || purchaseTrackedOrderIdRef.current === orderId) {
      return
    }

    if (cartStatus !== 'ready' || cartItems.length === 0) {
      return
    }

    purchaseTrackedOrderIdRef.current = orderId
    trackGoogleAnalyticsEvent('purchase', {
      currency: 'USD',
      transaction_id: orderId,
      value: totalPrice,
      items: buildGoogleAnalyticsItems(cartItems),
    })
    resetCart()
  }, [cartItems, cartStatus, orderId, resetCart, status, totalPrice])

  useEffect(() => {
    return () => {
      if (retryTimerRef.current) {
        clearTimeout(retryTimerRef.current)
      }
    }
  }, [])

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
          href={ROUTES.orders}
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
          href={ROUTES.orders}
          className="mt-4 rounded-lg bg-black px-6 py-3 text-white hover:bg-gray-800"
        >
          View your orders
        </Link>
      </div>
    )
  }

  if (status === 'failed') {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
        <h1 className="text-xl font-bold">Payment could not be completed</h1>
        <p className="mt-2 text-gray-600">
          The payment failed or expired. Please check your orders before trying
          again.
        </p>
        <Link
          href={ROUTES.orders}
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
        href={ROUTES.orders}
        className="mt-4 rounded-lg bg-black px-6 py-3 text-white hover:bg-gray-800"
      >
        View your orders
      </Link>
    </div>
  )
}
