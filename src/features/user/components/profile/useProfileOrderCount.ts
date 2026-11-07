'use client'

import { useEffect, useState } from 'react'
import { fetchOrders } from '@/features/orders/public'
import {
  captureAccountScope,
  useAccountScopeKey,
} from '@/features/auth/accountScope'

export function useProfileOrderCount(isAuthenticated: boolean): number | null {
  const accountKey = useAccountScopeKey()
  const [count, setCount] = useState<{ owner: string; value: number } | null>(
    null,
  )

  useEffect(() => {
    if (!isAuthenticated) {
      setCount(null)

      return
    }

    const controller = new AbortController()
    const account = captureAccountScope()
    let active = true

    const loadOrderCount = async (): Promise<void> => {
      try {
        const response = await fetchOrders({}, controller.signal)

        if (active && !controller.signal.aborted && account.isCurrent()) {
          setCount({ owner: account.key, value: response.totalElements ?? 0 })
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
  }, [isAuthenticated, accountKey])

  return count?.owner === accountKey && isAuthenticated ? count.value : null
}
