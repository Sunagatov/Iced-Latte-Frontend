'use client'

import { useEffect, useState } from 'react'
import { fetchOrders } from '@/features/orders/public'

export function useProfileOrderCount(isAuthenticated: boolean): number | null {
  const [orderCount, setOrderCount] = useState<number | null>(null)

  useEffect(() => {
    if (!isAuthenticated) {
      setOrderCount(null)

      return
    }

    const controller = new AbortController()
    let active = true

    const loadOrderCount = async (): Promise<void> => {
      try {
        const response = await fetchOrders({}, controller.signal)

        if (active && !controller.signal.aborted) {
          setOrderCount(response.totalElements ?? 0)
        }
      } catch {
        // Order count is decorative on the profile overview.
      }
    }

    void loadOrderCount()

    return () => {
      active = false
      controller.abort()
    }
  }, [isAuthenticated])

  return orderCount
}
