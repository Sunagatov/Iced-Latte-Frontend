import React from 'react'
import {
  RiCheckboxCircleLine,
  RiCloseCircleLine,
  RiMoneyDollarCircleLine,
  RiRefund2Line,
  RiStarLine,
  RiTimeLine,
  RiTruckLine,
} from 'react-icons/ri'
import type { OrderStatus } from '@/features/orders/types/orderTypes'

const STATUS_CONFIG: Record<
  OrderStatus,
  { label: string; icon: React.ReactNode; color: string }
> = {
  CREATED: {
    label: 'Order placed',
    icon: <RiTimeLine className="h-4 w-4" />,
    color: 'text-brand bg-brand-second',
  },
  PAID: {
    label: 'Paid',
    icon: <RiStarLine className="h-4 w-4" />,
    color: 'text-yellow-700 bg-yellow-50',
  },
  SHIPPED: {
    label: 'Shipped',
    icon: <RiTruckLine className="h-4 w-4" />,
    color: 'text-blue-700 bg-blue-50',
  },
  DELIVERED: {
    label: 'Delivered',
    icon: <RiCheckboxCircleLine className="h-4 w-4" />,
    color: 'text-green-700 bg-green-50',
  },
  CANCELLED: {
    label: 'Cancelled',
    icon: <RiCloseCircleLine className="h-4 w-4" />,
    color: 'text-gray-600 bg-gray-100',
  },
  REFUND_REQUESTED: {
    label: 'Refund requested',
    icon: <RiRefund2Line className="h-4 w-4" />,
    color: 'text-orange-700 bg-orange-50',
  },
  REFUNDED: {
    label: 'Refunded',
    icon: <RiMoneyDollarCircleLine className="h-4 w-4" />,
    color: 'text-purple-700 bg-purple-50',
  },
  // deprecated aliases
  DELIVERY: {
    label: 'Shipped',
    icon: <RiTruckLine className="h-4 w-4" />,
    color: 'text-blue-700 bg-blue-50',
  },
  FINISHED: {
    label: 'Delivered',
    icon: <RiCheckboxCircleLine className="h-4 w-4" />,
    color: 'text-green-700 bg-green-50',
  },
}

interface OrderStatusBadgeProps {
  status: OrderStatus
}

export default function OrderStatusBadge({
  status,
}: Readonly<OrderStatusBadgeProps>) {
  const config = STATUS_CONFIG[status] ?? STATUS_CONFIG.CREATED

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ${config.color}`}
    >
      {config.icon}
      {config.label}
    </span>
  )
}
