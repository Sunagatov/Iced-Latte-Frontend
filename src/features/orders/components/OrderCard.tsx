'use client'

import { useCallback, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  RiArrowRightSLine,
  RiCloseCircleLine,
  RiMapPinLine,
  RiRefund2Line,
  RiRepeatLine,
  RiShoppingBagLine,
} from 'react-icons/ri'
import OrderStatusBadge from '@/features/orders/components/OrderStatusBadge'
import ConfirmationModal from '@/features/orders/components/ConfirmationModal'
import {
  cancelOrder,
  fetchOrder,
  refundOrder,
  reorderOrder,
} from '@/features/orders/ordersApi'
import type { OrderDetailDto, OrderSummaryDto } from '@/features/orders/orderTypes'
import Loader from '@/shared/ui/Loader'

interface OrderCardProps {
  order: OrderSummaryDto
  onStatusChange?: () => void
}

export default function OrderCard({ order, onStatusChange }: Readonly<OrderCardProps>) {
  const router = useRouter()
  const [expanded, setExpanded] = useState(false)
  const [detail, setDetail] = useState<OrderDetailDto | null>(null)
  const [loadingDetail, setLoadingDetail] = useState(false)
  const [actionLoading, setActionLoading] = useState(false)
  const [actionError, setActionError] = useState('')
  const [modal, setModal] = useState<'cancel' | 'refund' | null>(null)
  const [refundReason, setRefundReason] = useState('')

  const date = new Date(order.createdAt).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })

  const handleToggle = useCallback(async () => {
    if (expanded) {
      setExpanded(false)
      return
    }
    setExpanded(true)
    if (!detail) {
      setLoadingDetail(true)
      try {
        const data = await fetchOrder(order.id)
        setDetail(data)
      } catch {
        setActionError('Could not load order details.')
      } finally {
        setLoadingDetail(false)
      }
    }
  }, [expanded, detail, order.id])

  const handleCancel = async () => {
    setModal(null)
    setActionLoading(true)
    setActionError('')
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
    try {
      const result = await reorderOrder(order.id)
      const msg =
        result.unavailableItems.length > 0
          ? `${result.addedItems} items added. ${result.unavailableItems.length} unavailable.`
          : `${result.addedItems} items added to cart.`
      alert(msg)
      router.push('/cart')
    } catch {
      setActionError('Could not re-order.')
    } finally {
      setActionLoading(false)
    }
  }

  const displayStatus = detail?.status ?? order.status

  return (
    <>
      <div className="bg-primary overflow-hidden rounded-2xl shadow-sm ring-1 ring-black/5">
        <button
          onClick={handleToggle}
          className="hover:bg-secondary flex w-full items-center justify-between px-5 py-4 text-left transition"
        >
          <div className="flex min-w-0 items-center gap-4">
            <div className="bg-secondary flex h-10 w-10 shrink-0 items-center justify-center rounded-xl">
              <RiShoppingBagLine className="text-brand h-5 w-5" />
            </div>
            <div className="min-w-0">
              <p className="text-secondary text-xs">
                Order #{order.id.slice(0, 8).toUpperCase()}
              </p>
              <p className="text-primary text-sm font-semibold">{date}</p>
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-3">
            <OrderStatusBadge status={displayStatus} />
            <span className="text-primary text-base font-bold tabular-nums">
              ${order.itemsTotalPrice.toFixed(2)}
            </span>
            <RiArrowRightSLine
              className={`text-disabled h-5 w-5 transition-transform ${expanded ? 'rotate-90' : ''}`}
            />
          </div>
        </button>

        {expanded && (
          <div className="space-y-3 border-t border-black/5 px-5 py-4">
            {loadingDetail ? (
              <div className="flex justify-center py-4">
                <Loader />
              </div>
            ) : detail ? (
              <>
                {detail.items.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between gap-2"
                  >
                    <div className="min-w-0">
                      <Link
                        href={`/product/${item.productId}`}
                        data-testid="order-product-link"
                        className="text-primary hover:text-brand block truncate text-sm font-medium"
                      >
                        {item.productName}
                      </Link>
                      <p className="text-secondary text-xs">
                        ${item.productPrice.toFixed(2)} × {item.productsQuantity}
                      </p>
                    </div>
                    <span className="text-primary shrink-0 text-sm font-semibold tabular-nums">
                      ${(item.productPrice * item.productsQuantity).toFixed(2)}
                    </span>
                  </div>
                ))}

                {detail.deliveryAddress && (
                  <div className="bg-secondary mt-3 flex items-start gap-2 rounded-xl px-3 py-2.5">
                    <RiMapPinLine className="text-brand mt-0.5 h-4 w-4 shrink-0" />
                    <p className="text-secondary text-xs">
                      {[
                        detail.deliveryAddress.line,
                        detail.deliveryAddress.city,
                        detail.deliveryAddress.country,
                      ]
                        .filter(Boolean)
                        .join(', ')}
                    </p>
                  </div>
                )}

                {actionError && (
                  <p className="text-negative text-xs">{actionError}</p>
                )}

                <div className="mt-3 flex flex-wrap gap-2">
                  {detail.canCancel && (
                    <ActionButton
                      onClick={() => setModal('cancel')}
                      disabled={actionLoading}
                      icon={<RiCloseCircleLine className="h-3.5 w-3.5" />}
                      label="Cancel"
                      variant="danger"
                    />
                  )}
                  {detail.canRefund && (
                    <ActionButton
                      onClick={() => setModal('refund')}
                      disabled={actionLoading}
                      icon={<RiRefund2Line className="h-3.5 w-3.5" />}
                      label="Request refund"
                      variant="warning"
                    />
                  )}
                  <ActionButton
                    onClick={handleReorder}
                    disabled={actionLoading}
                    icon={<RiRepeatLine className="h-3.5 w-3.5" />}
                    label="Buy again"
                    variant="default"
                  />
                </div>
              </>
            ) : (
              <p className="text-secondary text-sm">
                {order.firstItemName
                  ? `${order.firstItemName}${(order.itemCount ?? 0) > 1 ? ` + ${(order.itemCount ?? 1) - 1} more` : ''}`
                  : 'Order details'}
              </p>
            )}
          </div>
        )}
      </div>

      {modal === 'cancel' && (
        <ConfirmationModal
          title="Cancel order"
          message="Are you sure you want to cancel this order? This action cannot be undone."
          confirmLabel="Cancel order"
          variant="danger"
          onConfirm={handleCancel}
          onCancel={() => setModal(null)}
        />
      )}

      {modal === 'refund' && (
        <ConfirmationModal
          title="Request refund"
          message="Please provide a reason for the refund (optional)."
          confirmLabel="Request refund"
          variant="warning"
          onConfirm={handleRefund}
          onCancel={() => { setModal(null); setRefundReason('') }}
        >
          <textarea
            value={refundReason}
            onChange={(e) => setRefundReason(e.target.value)}
            placeholder="Reason for refund..."
            rows={3}
            className="bg-secondary text-primary placeholder:text-disabled mt-3 w-full rounded-lg border border-black/10 px-3 py-2 text-sm outline-none focus:border-orange-400"
          />
        </ConfirmationModal>
      )}
    </>
  )
}

function ActionButton({
  onClick,
  disabled,
  icon,
  label,
  variant,
}: {
  onClick: () => void
  disabled: boolean
  icon: React.ReactNode
  label: string
  variant: 'danger' | 'warning' | 'default'
}) {
  const colors = {
    danger: 'text-red-600 hover:bg-red-50 ring-red-200',
    warning: 'text-orange-600 hover:bg-orange-50 ring-orange-200',
    default: 'text-brand hover:bg-brand-second ring-black/10',
  }

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium ring-1 transition disabled:opacity-50 ${colors[variant]}`}
    >
      {icon}
      {label}
    </button>
  )
}
