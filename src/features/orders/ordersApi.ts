import type {
  CreateOrderRequest,
  OrderDetailDto,
  OrderPageDto,
  OrderStatus,
  RefundRequest,
  ReorderResponse,
} from '@/features/orders/orderTypes'
import {
  cancelOrder as cancelGeneratedOrder,
  createOrder as createGeneratedOrder,
  getOrderById,
  getOrders,
  reorder,
  requestRefund,
} from '@/shared/api/generated/order'

export async function fetchOrders(
  params: {
    status?: OrderStatus
    page?: number
    size?: number
    sortBy?: string
    sortDirection?: string
    year?: number
  } = {},
  signal?: AbortSignal,
): Promise<OrderPageDto> {
  const options = { cache: false, signal }

  return getOrders({
    ...params,
    status: params.status ? [params.status] : undefined,
  }, options) as Promise<OrderPageDto>
}

export async function fetchOrder(
  orderId: string,
  signal?: AbortSignal,
): Promise<OrderDetailDto> {
  const options = { cache: false, signal }

  return getOrderById(orderId, options) as Promise<OrderDetailDto>
}

export async function createOrder(
  payload: CreateOrderRequest,
  idempotencyKey?: string,
): Promise<OrderDetailDto> {
  return createGeneratedOrder(
    payload,
    idempotencyKey ? { 'Idempotency-Key': idempotencyKey } : undefined,
  ) as Promise<OrderDetailDto>
}

export async function cancelOrder(orderId: string): Promise<OrderDetailDto> {
  return cancelGeneratedOrder(orderId) as Promise<OrderDetailDto>
}

export async function refundOrder(
  orderId: string,
  request?: RefundRequest,
): Promise<OrderDetailDto> {
  return requestRefund(orderId, request ?? {}) as Promise<OrderDetailDto>
}

export async function reorderOrder(
  orderId: string,
): Promise<ReorderResponse> {
  return reorder(orderId) as Promise<ReorderResponse>
}
