import React from 'react'
import {
  RiCheckboxCircleLine,
  RiStarLine,
  RiTruckLine,
} from 'react-icons/ri'
import type { Order } from '@/features/orders/types/orderTypes'

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

interface OrderStatusBadgeProps {
  status: Order['status']
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
