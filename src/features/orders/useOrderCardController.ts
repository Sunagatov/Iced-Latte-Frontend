'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useCartStore } from '@/features/cart/cartStore'
import {
  cancelOrder,
  fetchOrder,
  refundOrder,
  reorderOrder,
} from '@/features/orders/ordersApi'
import type { OrderDetailDto, OrderSummaryDto } from '@/features/orders/orderTypes'
import { ROUTES } from '@/shared/config/routes'

export type OrderActionModal = 'cancel' | 'refund' | null

interface UseOrderCardControllerParams {
  order: OrderSummaryDto
  onStatusChange?: () => void
}

export function useOrderCardController({
  order,
  onStatusChange,
}: UseOrderCardControllerParams) {
  const router = useRouter()
  const [expanded, setExpanded] = useState(false)
  const [detail, setDetail] = useState<OrderDetailDto | null>(null)
  const [loadingDetail, setLoadingDetail] = useState(false)
  const [actionLoading, setActionLoading] = useState(false)
  const [actionError, setActionError] = useState('')
  const [actionMessage, setActionMessage] = useState('')
  const [modal, setModal] = useState<OrderActionModal>(null)
  const [refundReason, setRefundReason] = useState('')
  const hydrateCart = useCartStore((state) => state.hydrate)
  const detailRequestRef = useRef<AbortController | null>(null)

  useEffect(() => {
    return () => {
      detailRequestRef.current?.abort()
    }
  }, [])

  const handleToggle = useCallback(async () => {
    if (expanded) {
      detailRequestRef.current?.abort()
      detailRequestRef.current = null
      setExpanded(false)

      return
    }

    setExpanded(true)
    if (!detail) {
      detailRequestRef.current?.abort()
      const controller = new AbortController()

      detailRequestRef.current = controller
      setLoadingDetail(true)
      try {
        const data = await fetchOrder(order.id, controller.signal)

        if (!controller.signal.aborted && detailRequestRef.current === controller) {
          setDetail(data)
        }
      } catch {
        if (controller.signal.aborted) {
          return
        }

        setActionError('Could not load order details.')
      } finally {
        if (!controller.signal.aborted && detailRequestRef.current === controller) {
          setLoadingDetail(false)
          detailRequestRef.current = null
        }
      }
    }
  }, [expanded, detail, order.id])

  const handleCancel = async () => {
    setModal(null)
    setActionLoading(true)
    setActionError('')
    setActionMessage('')
    try {
      const updated = await cancelOrder(order.id)

      setDetail(updated)
      onStatusChange?.()
    } catch {
      setActionError('Could not cancel order.')
    } finally {
      setActionLoading(false)
    }
  }

  const handleRefund = async () => {
    const reason = refundReason.trim() || undefined

    setModal(null)
    setRefundReason('')
    setActionLoading(true)
    setActionError('')
    setActionMessage('')
    try {
      const updated = await refundOrder(order.id, reason ? { reason } : undefined)

      setDetail(updated)
      onStatusChange?.()
    } catch {
      setActionError('Could not request refund.')
    } finally {
      setActionLoading(false)
    }
  }

  const handleReorder = async () => {
    setActionLoading(true)
    setActionError('')
    setActionMessage('')
    let msg = ''

    try {
      const result = await reorderOrder(order.id)

      msg =
        result.unavailableItems.length > 0
          ? `${result.addedItems} items added. ${result.unavailableItems.length} unavailable.`
          : `${result.addedItems} items added to cart.`
    } catch {
      setActionError('Could not re-order.')
      setActionLoading(false)

      return
    }

    try {
      await hydrateCart()
    } catch {
      setActionError('Items were added, but the cart could not refresh.')
    } finally {
      setActionLoading(false)
    }

    setActionMessage(msg)
    router.push(ROUTES.cart)
  }

  const closeRefundModal = () => {
    setModal(null)
    setRefundReason('')
  }

  return {
    actionError,
    actionLoading,
    actionMessage,
    closeRefundModal,
    detail,
    displayStatus: detail?.status ?? order.status,
    expanded,
    handleCancel,
    handleRefund,
    handleReorder,
    handleToggle,
    loadingDetail,
    modal,
    refundReason,
    setModal,
    setRefundReason,
  }
}
