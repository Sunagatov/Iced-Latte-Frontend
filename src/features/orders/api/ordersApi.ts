import type { AxiosResponse } from 'axios'
import { api } from '@/shared/api/client'
import type {
  CreateOrderRequest,
  OrderDetailDto,
  OrderPageDto,
  OrderStatus,
  RefundRequest,
  ReorderResponse,
} from '@/features/orders/types/orderTypes'

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
  const query = new URLSearchParams()

  if (params.status) query.set('status', params.status)
  if (params.page !== undefined) query.set('page', String(params.page))
  if (params.size !== undefined) query.set('size', String(params.size))
  if (params.sortBy) query.set('sortBy', params.sortBy)
  if (params.sortDirection) query.set('sortDirection', params.sortDirection)
  if (params.year) query.set('year', String(params.year))

  const qs = query.toString()
  const url = qs ? `/orders?${qs}` : '/orders'
  const response: AxiosResponse<OrderPageDto> = await api.get(url, {
    cache: false,
    signal,
  })

  return response.data
}

export async function fetchOrder(
  orderId: string,
  signal?: AbortSignal,
): Promise<OrderDetailDto> {
  const response: AxiosResponse<OrderDetailDto> = await api.get(
    `/orders/${orderId}`,
    { cache: false, signal },
  )

  return response.data
}

export async function createOrder(
  payload: CreateOrderRequest,
  idempotencyKey?: string,
): Promise<OrderDetailDto> {
  const headers: Record<string, string> = {}

  if (idempotencyKey) {
    headers['Idempotency-Key'] = idempotencyKey
  }

  const response: AxiosResponse<OrderDetailDto> = await api.post(
    '/orders',
    payload,
    { headers },
  )

  return response.data
}

export async function cancelOrder(orderId: string): Promise<OrderDetailDto> {
  const response: AxiosResponse<OrderDetailDto> = await api.post(
    `/orders/${orderId}/cancel`,
  )

  return response.data
}

export async function refundOrder(
  orderId: string,
  request?: RefundRequest,
): Promise<OrderDetailDto> {
  const response: AxiosResponse<OrderDetailDto> = await api.post(
    `/orders/${orderId}/refund`,
    request ?? {},
  )

  return response.data
}

export async function reorderOrder(
  orderId: string,
): Promise<ReorderResponse> {
  const response: AxiosResponse<ReorderResponse> = await api.post(
    `/orders/${orderId}/reorder`,
  )

  return response.data
}
