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
  type OrderDto,
  type OrderItemDto,
  type OrderPageDto as GeneratedOrderPageDto,
  type OrderStatus as GeneratedOrderStatus,
  type OrderSummaryDto as GeneratedOrderSummaryDto,
  type ReorderResponseDto,
} from '@/shared/api/generated/order'

function normalizeStatus(status?: GeneratedOrderStatus): OrderStatus {
  if (status === 'DELIVERY') return 'SHIPPED'
  if (status === 'FINISHED') return 'DELIVERED'

  return status ?? 'CREATED'
}

function normalizeOrderItem(item: OrderItemDto): OrderDetailDto['items'][number] {
  return {
    id: item.id ?? '',
    productId: item.productId ?? '',
    productName: item.productName ?? '',
    productPrice: item.productPrice ?? 0,
    productsQuantity: item.productsQuantity ?? 0,
  }
}

function normalizeOrderSummary(order: GeneratedOrderSummaryDto): OrderPageDto['content'][number] {
  return {
    id: order.id ?? '',
    status: normalizeStatus(order.status),
    createdAt: order.createdAt ?? '',
    itemsQuantity: order.itemsQuantity ?? 0,
    itemsTotalPrice: order.itemsTotalPrice ?? 0,
    firstItemName: order.firstItemName,
    itemCount: order.itemCount,
  }
}

function normalizeOrderDetail(order: OrderDto): OrderDetailDto {
  return {
    id: order.id ?? '',
    status: normalizeStatus(order.status),
    createdAt: order.createdAt ?? '',
    updatedAt: order.updatedAt,
    itemsQuantity: order.itemsQuantity ?? 0,
    itemsTotalPrice: order.itemsTotalPrice ?? 0,
    items: (order.items ?? []).map(normalizeOrderItem),
    deliveryAddress: order.deliveryAddress,
    recipientName: order.recipientName,
    recipientSurname: order.recipientSurname,
    recipientPhone: order.recipientPhone,
    cancellationDeadline: order.cancellationDeadline,
    canCancel: order.canCancel,
    canRefund: order.canRefund,
  }
}

function normalizeOrderPage(page: GeneratedOrderPageDto): OrderPageDto {
  return {
    content: (page.content ?? []).map(normalizeOrderSummary),
    page: page.page ?? 0,
    size: page.size ?? 0,
    totalElements: page.totalElements ?? 0,
    totalPages: page.totalPages ?? 0,
  }
}

function normalizeReorderResponse(response: ReorderResponseDto): ReorderResponse {
  return {
    cartId: response.cartId,
    addedItems: response.addedItems ?? 0,
    unavailableItems: (response.unavailableItems ?? []).map((item) => ({
      productName: item.productName ?? '',
      reason: item.reason ?? '',
    })),
  }
}

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

  const page = await getOrders({
    ...params,
    status: params.status ? [params.status] : undefined,
  }, options)

  return normalizeOrderPage(page)
}

export async function fetchOrder(
  orderId: string,
  signal?: AbortSignal,
): Promise<OrderDetailDto> {
  const options = { cache: false, signal }
  const order = await getOrderById(orderId, options)

  return normalizeOrderDetail(order)
}

export async function createOrder(
  payload: CreateOrderRequest,
  idempotencyKey?: string,
): Promise<OrderDetailDto> {
  const order = await createGeneratedOrder(
    payload,
    idempotencyKey ? { 'Idempotency-Key': idempotencyKey } : undefined,
  )

  return normalizeOrderDetail(order)
}

export async function cancelOrder(orderId: string): Promise<OrderDetailDto> {
  const order = await cancelGeneratedOrder(orderId)

  return normalizeOrderDetail(order)
}

export async function refundOrder(
  orderId: string,
  request?: RefundRequest,
): Promise<OrderDetailDto> {
  const order = await requestRefund(orderId, request ?? {})

  return normalizeOrderDetail(order)
}

export async function reorderOrder(
  orderId: string,
): Promise<ReorderResponse> {
  const response = await reorder(orderId)

  return normalizeReorderResponse(response)
}
