export interface OrderItem {
  id: string
  productId: string
  productName: string
  productPrice: number
  productsQuantity: number
}

export interface OrderAddress {
  country?: string
  city?: string
  line?: string
  postcode?: string
}

export type OrderStatus =
  | 'PENDING_PAYMENT'
  | 'CREATED'
  | 'PAID'
  | 'SHIPPED'
  | 'DELIVERED'
  | 'CANCELLED'
  | 'REFUND_REQUESTED'
  | 'REFUNDED'
  | 'PAYMENT_FAILED'
  | 'PAYMENT_EXPIRED'
  // deprecated — kept for backward compatibility during transition
  | 'DELIVERY'
  | 'FINISHED'

export interface OrderSummaryDto {
  id: string
  status: OrderStatus
  createdAt: string
  itemsQuantity: number
  itemsTotalPrice: number
  firstItemName?: string
  itemCount?: number
}

export interface OrderDetailDto {
  id: string
  status: OrderStatus
  createdAt: string
  updatedAt?: string
  itemsQuantity: number
  itemsTotalPrice: number
  items: OrderItem[]
  deliveryAddress?: OrderAddress
  recipientName?: string
  recipientSurname?: string
  recipientPhone?: string
  cancellationDeadline?: string
  canCancel?: boolean
  canRefund?: boolean
}

export interface OrderPageDto {
  content: OrderSummaryDto[]
  page: number
  size: number
  totalElements: number
  totalPages: number
}

export interface CreateOrderRequest {
  recipientName: string
  recipientSurname: string
  recipientPhone?: string
  deliveryAddressId?: string
  address?: Required<OrderAddress>
}

export interface RefundRequest {
  reason?: string
}

export interface UnavailableItem {
  productName: string
  reason: string
}

export interface ReorderResponse {
  cartId?: string
  addedItems: number
  unavailableItems: UnavailableItem[]
}
