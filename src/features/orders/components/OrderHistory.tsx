'use client'

import React, { useEffect, useState } from 'react'
import { api } from '@/shared/api/client'
import Link from 'next/link'
import Loader from '@/shared/components/Loader/Loader'
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

const STATUS_CONFIG: Record<
  Order['status'],
  { label: string; icon: React.ReactNode; color: string }
> = {
  CREATED: {
    label: 'Order placed',
    icon: <RiCheckboxCircleLine className="h-4 w-4" />,
    color: 'text-brand bg-brand-second',
  },
  PAID: {
    label: 'Paid',
    icon: <RiStarLine className="h-4 w-4" />,
    color: 'text-yellow-700 bg-yellow-50',
  },
  DELIVERY: {
    label: 'On the way',
    icon: <RiTruckLine className="h-4 w-4" />,
    color: 'text-blue-700 bg-blue-50',
  },
  FINISHED: {
    label: 'Delivered',
    icon: <RiCheckboxCircleLine className="h-4 w-4" />,
    color: 'text-green-700 bg-green-50',
  },
}

function StatusBadge({ status }: { status: Order['status'] }) {
  const cfg = STATUS_CONFIG[status] ?? STATUS_CONFIG.CREATED

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ${cfg.color}`}
    >
      {cfg.icon}
      {cfg.label}
    </span>
  )
}

function OrderCard({ order }: { order: Order }) {
  const [expanded, setExpanded] = useState(false)
  const date = new Date(order.createdAt).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })

  return (
    <div className="bg-primary overflow-hidden rounded-2xl shadow-sm ring-1 ring-black/5">
      {/* Header */}
      <button
        onClick={() => setExpanded(!expanded)}
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
          <StatusBadge status={order.status} />
          <span className="text-primary text-base font-bold tabular-nums">
            ${order.itemsTotalPrice?.toFixed(2) ?? '—'}
          </span>
          <RiArrowRightSLine
            className={`text-disabled h-5 w-5 transition-transform ${expanded ? 'rotate-90' : ''}`}
          />
        </div>
      </button>

      {/* Expanded items */}
      {expanded && (
        <div className="space-y-3 border-t border-black/5 px-5 py-4">
          {order.items?.map((item) => (
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
                  ${item.productPrice?.toFixed(2)} × {item.productsQuantity}
                </p>
              </div>
              <span className="text-primary shrink-0 text-sm font-semibold tabular-nums">
                ${(item.productPrice * item.productsQuantity).toFixed(2)}
              </span>
            </div>
          ))}

          {order.deliveryAddress && (
            <div className="bg-secondary mt-3 flex items-start gap-2 rounded-xl px-3 py-2.5">
              <RiMapPinLine className="text-brand mt-0.5 h-4 w-4 shrink-0" />
              <p className="text-secondary text-xs">
                {[
                  order.deliveryAddress.line,
                  order.deliveryAddress.city,
                  order.deliveryAddress.country,
                ]
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
  const [retryKey, setRetryKey] = useState(0)

  useEffect(() => {
    const controller = new AbortController()

    setLoading(true)
    setError(false)
    const url = filter ? `/orders?status=${filter}` : '/orders'

    api
      .get<Order[]>(url, { signal: controller.signal })
      .then((res) => setOrders(res.data))
      .catch((err) => {
        if (err?.code !== 'ERR_CANCELED') setError(true)
      })
      .finally(() => setLoading(false))

    return () => {
      controller.abort()
    }
  }, [filter, retryKey])

  return (
    <div className="mx-auto w-full max-w-[800px] px-4 py-8">
      {/* Header */}
      <div className="mb-6 flex items-baseline gap-3">
        <h1 className="text-primary text-3xl font-bold">My Orders</h1>
        {!loading && (
          <span className="bg-secondary text-secondary rounded-full px-3 py-0.5 text-sm font-medium">
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
            data-testid={`order-filter-${f.label.toLowerCase().replace(/\s+/g, '-')}`}
            aria-pressed={filter === f.value}
            className={`shrink-0 rounded-full px-4 py-1.5 text-sm font-medium transition ${
              filter === f.value
                ? 'bg-brand text-white'
                : 'bg-primary text-secondary hover:bg-secondary ring-1 ring-black/10'
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
          <p className="text-secondary">
            Could not load orders. Please try again.
          </p>
          <button
            onClick={() => setRetryKey((k) => k + 1)}
            className="bg-brand hover:bg-brand-solid-hover rounded-lg px-5 py-2 text-sm font-medium text-white"
          >
            Retry
          </button>
        </div>
      ) : orders.length === 0 ? (
        <div className="flex min-h-[40vh] flex-col items-center justify-center gap-4 text-center">
          <div className="bg-secondary flex h-16 w-16 items-center justify-center rounded-2xl">
            <RiTimeLine className="text-disabled h-8 w-8" />
          </div>
          <div>
            <p className="text-primary font-semibold">No orders yet</p>
            <p className="text-secondary mt-1 text-sm">
              Your order history will appear here.
            </p>
          </div>
          <Link
            href="/"
            className="bg-brand-solid text-inverted hover:bg-brand-solid-hover rounded-[48px] px-6 py-2.5 text-sm font-semibold transition"
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
