'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import {
  captureAccountScope,
  useAccountScopeKey,
} from '@/features/auth/accountScope'
import { useAuthStore } from '@/features/auth/store'
import { fetchOrders } from '@/features/orders/ordersApi'
import type {
  OrderPageDto,
  OrderStatus,
  OrderSummaryDto,
} from '@/features/orders/orderTypes'

export type OrderFilter = '' | OrderStatus

function isCanceledRequest(err: unknown): boolean {
  return (
    (err as { code?: string }).code === 'ERR_CANCELED' ||
    (err as { name?: string }).name === 'AbortError' ||
    (err as { name?: string }).name === 'CanceledError'
  )
}

export function useOrders(filter: OrderFilter, pageSize = 10, year?: number) {
  const accountKey = useAccountScopeKey()
  const authenticated = useAuthStore(
    (state) => state.status === 'authenticated',
  )
  const [owner, setOwner] = useState(accountKey)
  const [orders, setOrders] = useState<OrderSummaryDto[]>([])
  const [page, setPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [totalElements, setTotalElements] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [retryKey, setRetryKey] = useState(0)
  const activeQueryRef = useRef({ filter, year, accountKey })

  useEffect(() => {
    const queryChanged =
      activeQueryRef.current.filter !== filter ||
      activeQueryRef.current.year !== year ||
      activeQueryRef.current.accountKey !== accountKey

    if (queryChanged) {
      activeQueryRef.current = { filter, year, accountKey }

      if (page !== 0) {
        setPage(0)

        return
      }
    }

    const controller = new AbortController()
    const account = captureAccountScope()
    let active = true

    setOwner(accountKey)
    setOrders([])
    setTotalElements(0)
    setTotalPages(0)
    setLoading(true)
    setError(false)
    if (!authenticated) {
      setLoading(false)

      return
    }

    fetchOrders(
      {
        status: filter || undefined,
        page,
        size: pageSize,
        sortBy: 'createdAt',
        sortDirection: 'DESC',
        year,
      },
      controller.signal,
    )
      .then((data: OrderPageDto) => {
        if (!active || controller.signal.aborted || !account.isCurrent()) return

        const lastPage = Math.max(0, data.totalPages - 1)

        if (page > lastPage) {
          setPage(lastPage)

          return
        }

        setOrders(data.content)
        setTotalPages(data.totalPages)
        setTotalElements(data.totalElements)
      })
      .catch((err) => {
        if (active && account.isCurrent() && !isCanceledRequest(err)) {
          setError(true)
        }
      })
      .finally(() => {
        if (active && !controller.signal.aborted && account.isCurrent()) {
          setLoading(false)
        }
      })

    return () => {
      active = false
      controller.abort()
    }
  }, [filter, page, pageSize, year, retryKey, accountKey, authenticated])

  const goToPage = useCallback(
    (p: number) =>
      setPage(() => {
        if (totalPages <= 0) return Math.max(0, p)

        return Math.min(Math.max(0, p), totalPages - 1)
      }),
    [totalPages],
  )

  return {
    error: owner === accountKey && error,
    goToPage,
    loading: authenticated && (owner !== accountKey || loading),
    orders: owner === accountKey ? orders : [],
    page: owner === accountKey ? page : 0,
    retry: () => setRetryKey((value) => value + 1),
    totalElements: owner === accountKey ? totalElements : 0,
    totalPages: owner === accountKey ? totalPages : 0,
  }
}
