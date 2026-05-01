import type { AxiosResponse } from 'axios'
import { api } from '@/shared/api/client'
import type {
  CreateOrderRequest,
  Order,
} from '@/features/orders/types/orderTypes'

export async function fetchOrders(
  status?: Order['status'],
  signal?: AbortSignal,
): Promise<Order[]> {
  const url = status ? `/orders?status=${status}` : '/orders'
  const response: AxiosResponse<Order[]> = await api.get(url, {
    cache: false,
    signal,
  })

  return response.data
}

export async function createOrder(payload: CreateOrderRequest): Promise<void> {
  await api.post('/orders', payload)
}
