'use client'

import React from 'react'
import Link from 'next/link'
import { RiTimeLine } from 'react-icons/ri'
import Loader from '@/shared/ui/Loader/Loader'
import OrderCard from '@/features/orders/components/OrderCard'
import { useOrders, type OrderFilter } from '@/features/orders/hooks/useOrders'

const FILTERS: { label: string; value: OrderFilter }[] = [
  { label: 'All', value: '' },
  { label: 'Placed', value: 'CREATED' },
  { label: 'Paid', value: 'PAID' },
  { label: 'On the way', value: 'DELIVERY' },
  { label: 'Delivered', value: 'FINISHED' },
]

export default function OrderHistory() {
  const [filter, setFilter] = React.useState<OrderFilter>('')
  const { error, loading, orders, retry } = useOrders(filter)

  return (
    <div className="mx-auto w-full max-w-[800px] px-4 py-8">
      <div className="mb-6 flex items-baseline gap-3">
        <h1 className="text-primary text-3xl font-bold">My Orders</h1>
        {!loading && (
          <span className="bg-secondary text-secondary rounded-full px-3 py-0.5 text-sm font-medium">
            {orders.length} {orders.length === 1 ? 'order' : 'orders'}
          </span>
        )}
      </div>

      <div className="mb-5 flex gap-2 overflow-x-auto pb-1">
        {FILTERS.map((option) => (
          <button
            key={option.value}
            onClick={() => setFilter(option.value)}
            data-testid={`order-filter-${option.label.toLowerCase().replace(/\s+/g, '-')}`}
            aria-pressed={filter === option.value}
            className={`shrink-0 rounded-full px-4 py-1.5 text-sm font-medium transition ${
              filter === option.value
                ? 'bg-brand text-white'
                : 'bg-primary text-secondary hover:bg-secondary ring-1 ring-black/10'
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>

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
            onClick={retry}
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
