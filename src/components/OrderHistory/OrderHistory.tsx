'use client'

import React, { useEffect, useState } from 'react'
import { api } from '@/services/apiConfig/apiConfig'
import Link from 'next/link'
import Loader from '@/components/UI/Loader/Loader'
import {
  RiShoppingBagLine,
  RiMapPinLine,
  RiArrowRightSLine,
  RiCheckboxCircleLine,
  RiTimeLine,
  RiTruckLine,
  RiStarLine,
} from 'react-icons/ri'

interface OrderItem {
  id: string
  productId: string
  productName: string
  productPrice: number
  productsQuantity: number
}

interface AddressDto {
  country?: string
  city?: string
  line?: string
  postcode?: string
}

interface Order {
  id: string
  status: 'CREATED' | 'PAID' | 'DELIVERY' | 'FINISHED'
  createdAt: string
  itemsQuantity: number
  itemsTotalPrice: number
  items: OrderItem[]
  deliveryAddress?: AddressDto
}

const STATUS_CONFIG: Record<Order['status'], { label: string; icon: React.ReactNode; color: string }> = {
  CREATED:  { label: 'Order placed',  icon: <RiCheckboxCircleLine className="h-4 w-4" />, color: 'text-brand bg-brand-second' },
  PAID:     { label: 'Paid',          icon: <RiStarLine className="h-4 w-4" />,            color: 'text-yellow-700 bg-yellow-50' },
  DELIVERY: { label: 'On the way',    icon: <RiTruckLine className="h-4 w-4" />,           color: 'text-blue-700 bg-blue-50' },
  FINISHED: { label: 'Delivered',     icon: <RiCheckboxCircleLine className="h-4 w-4" />, color: 'text-green-700 bg-green-50' },
}

function StatusBadge({ status }: { status: Order['status'] }) {
  const cfg = STATUS_CONFIG[status] ?? STATUS_CONFIG.CREATED
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ${cfg.color}`}>
      {cfg.icon}
      {cfg.label}
    </span>
  )
}

function OrderCard({ order }: { order: Order }) {
  const [expanded, setExpanded] = useState(false)
  const date = new Date(order.createdAt).toLocaleDateString('en-GB', {
    day: 'numeric', month: 'short', year: 'numeric',
  })

  return (
    <div className="rounded-2xl bg-primary shadow-sm ring-1 ring-black/5 overflow-hidden">
      {/* Header */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex w-full items-center justify-between px-5 py-4 text-left transition hover:bg-secondary"
      >
        <div className="flex items-center gap-4 min-w-0">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-secondary">
            <RiShoppingBagLine className="h-5 w-5 text-brand" />
          </div>
          <div className="min-w-0">
            <p className="text-xs text-secondary">Order #{order.id.slice(0, 8).toUpperCase()}</p>
            <p className="text-sm font-semibold text-primary">{date}</p>
          </div>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <StatusBadge status={order.status} />
          <span className="text-base font-bold text-primary tabular-nums">
            ${order.itemsTotalPrice?.toFixed(2) ?? '—'}
          </span>
          <RiArrowRightSLine
            className={`h-5 w-5 text-disabled transition-transform ${expanded ? 'rotate-90' : ''}`}
          />
        </div>
      </button>

      {/* Expanded items */}
      {expanded && (
        <div className="border-t border-black/5 px-5 py-4 space-y-3">
          {order.items?.map((item) => (
            <div key={item.id} className="flex items-center justify-between gap-2">
              <div className="min-w-0">
                <Link
                  href={`/product/${item.productId}`}
                  className="text-sm font-medium text-primary hover:text-brand truncate block"
                >
                  {item.productName}
                </Link>
                <p className="text-xs text-secondary">
                  ${item.productPrice?.toFixed(2)} × {item.productsQuantity}
                </p>
              </div>
              <span className="shrink-0 text-sm font-semibold tabular-nums text-primary">
                ${(item.productPrice * item.productsQuantity).toFixed(2)}
              </span>
            </div>
          ))}

          {order.deliveryAddress && (
            <div className="mt-3 flex items-start gap-2 rounded-xl bg-secondary px-3 py-2.5">
              <RiMapPinLine className="mt-0.5 h-4 w-4 shrink-0 text-brand" />
              <p className="text-xs text-secondary">
                {[order.deliveryAddress.line, order.deliveryAddress.city, order.deliveryAddress.country]
                  .filter(Boolean)
                  .join(', ')}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

const FILTERS: { label: string; value: string }[] = [
  { label: 'All', value: '' },
  { label: 'Placed', value: 'CREATED' },
  { label: 'Paid', value: 'PAID' },
  { label: 'On the way', value: 'DELIVERY' },
  { label: 'Delivered', value: 'FINISHED' },
]

export default function OrderHistory() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('')
  const [error, setError] = useState(false)

  useEffect(() => {
    setLoading(true)
    setError(false)
    const url = filter ? `/orders?status=${filter}` : '/orders'
    api.get<Order[]>(url)
      .then((res) => setOrders(res.data))
      .catch(() => setError(true))
      .finally(() => setLoading(false))
  }, [filter])

  return (
    <div className="mx-auto w-full max-w-[800px] px-4 py-8">
      {/* Header */}
      <div className="mb-6 flex items-baseline gap-3">
        <h1 className="text-3xl font-bold text-primary">My Orders</h1>
        {!loading && (
          <span className="rounded-full bg-secondary px-3 py-0.5 text-sm font-medium text-secondary">
            {orders.length} {orders.length === 1 ? 'order' : 'orders'}
          </span>
        )}
      </div>

      {/* Filter tabs */}
      <div className="mb-5 flex gap-2 overflow-x-auto pb-1">
        {FILTERS.map((f) => (
          <button
            key={f.value}
            onClick={() => setFilter(f.value)}
            className={`shrink-0 rounded-full px-4 py-1.5 text-sm font-medium transition ${
              filter === f.value
                ? 'bg-brand text-white'
                : 'bg-primary text-secondary ring-1 ring-black/10 hover:bg-secondary'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex min-h-[40vh] items-center justify-center">
          <Loader />
        </div>
      ) : error ? (
        <div className="flex min-h-[40vh] flex-col items-center justify-center gap-3 text-center">
          <p className="text-secondary">Could not load orders. Please try again.</p>
          <button
            onClick={() => setFilter(filter)}
            className="rounded-lg bg-brand px-5 py-2 text-sm font-medium text-white hover:bg-brand-solid-hover"
          >
            Retry
          </button>
        </div>
      ) : orders.length === 0 ? (
        <div className="flex min-h-[40vh] flex-col items-center justify-center gap-4 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-secondary">
            <RiTimeLine className="h-8 w-8 text-disabled" />
          </div>
          <div>
            <p className="font-semibold text-primary">No orders yet</p>
            <p className="mt-1 text-sm text-secondary">Your order history will appear here.</p>
          </div>
          <Link
            href="/"
            className="rounded-[48px] bg-brand-solid px-6 py-2.5 text-sm font-semibold text-inverted transition hover:bg-brand-solid-hover"
          >
            Start shopping
          </Link>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {orders.map((order) => (
            <OrderCard key={order.id} order={order} />
          ))}
        </div>
      )}
    </div>
  )
}
