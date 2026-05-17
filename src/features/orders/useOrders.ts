'use client'

import { useCallback, useEffect, useState } from 'react'
import { fetchOrders } from '@/features/orders/ordersApi'
import type {
  OrderPageDto,
  OrderStatus,
  OrderSummaryDto,
} from '@/features/orders/orderTypes'

export type OrderFilter = '' | OrderStatus

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
        setOrders(data.content)
        setTotalPages(data.totalPages)
        setTotalElements(data.totalElements)
      })
      .catch((err) => {
        if (err?.code !== 'ERR_CANCELED') {
          setError(true)
        }
      })
      .finally(() => setLoading(false))

    return () => {
      controller.abort()
    }
  }, [filter, page, pageSize, year, retryKey])

  const goToPage = useCallback((p: number) => setPage(p), [])

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
