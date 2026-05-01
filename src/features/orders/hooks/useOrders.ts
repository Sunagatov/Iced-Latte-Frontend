'use client'

import { useEffect, useState } from 'react'
import { fetchOrders } from '@/features/orders/api/ordersApi'
import type { Order } from '@/features/orders/types/orderTypes'

export type OrderFilter = '' | Order['status']

export function useOrders(filter: OrderFilter) {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [retryKey, setRetryKey] = useState(0)

  useEffect(() => {
    const controller = new AbortController()

    setLoading(true)
    setError(false)

    fetchOrders(filter || undefined, controller.signal)
      .then(setOrders)
      .catch((err) => {
        if (err?.code !== 'ERR_CANCELED') {
          setError(true)
        }
      })
      .finally(() => setLoading(false))

    return () => {
      controller.abort()
    }
  }, [filter, retryKey])

  return {
    error,
    loading,
    orders,
    retry: () => setRetryKey((value) => value + 1),
  }
}
