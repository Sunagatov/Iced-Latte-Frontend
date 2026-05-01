'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  RiArrowRightSLine,
  RiMapPinLine,
  RiShoppingBagLine,
} from 'react-icons/ri'
import OrderStatusBadge from '@/features/orders/components/OrderStatusBadge'
import type { Order } from '@/features/orders/types/orderTypes'

interface OrderCardProps {
  order: Order
}

export default function OrderCard({ order }: Readonly<OrderCardProps>) {
  const [expanded, setExpanded] = useState(false)
  const date = new Date(order.createdAt).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })

  return (
    <div className="bg-primary overflow-hidden rounded-2xl shadow-sm ring-1 ring-black/5">
      <button
        onClick={() => setExpanded((value) => !value)}
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
          <OrderStatusBadge status={order.status} />
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
          {order.items.map((item) => (
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
