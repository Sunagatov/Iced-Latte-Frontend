'use client'

import { useCallback, useEffect, useState } from 'react'
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
  const [orders, setOrders] = useState<OrderSummaryDto[]>([])
  const [page, setPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [totalElements, setTotalElements] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [retryKey, setRetryKey] = useState(0)

  useEffect(() => {
    setPage(0)
  }, [filter, year])

  useEffect(() => {
    const controller = new AbortController()
    let active = true

    setLoading(true)
    setError(false)

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
        if (!active || controller.signal.aborted) return

        setOrders(data.content)
        setTotalPages(data.totalPages)
        setTotalElements(data.totalElements)
      })
      .catch((err) => {
        if (active && !isCanceledRequest(err)) {
          setError(true)
        }
      })
      .finally(() => {
        if (active && !controller.signal.aborted) {
          setLoading(false)
        }
      })

    return () => {
      active = false
      controller.abort()
    }
  }, [filter, page, pageSize, year, retryKey])

  const goToPage = useCallback(
    (p: number) =>
      setPage(() => {
        if (totalPages <= 0) return Math.max(0, p)

        return Math.min(Math.max(0, p), totalPages - 1)
      }),
    [totalPages],
  )

  return {
    error,
    goToPage,
    loading,
    orders,
    page,
    retry: () => setRetryKey((value) => value + 1),
    totalElements,
    totalPages,
  }
}
