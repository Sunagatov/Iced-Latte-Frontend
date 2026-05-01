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

export interface Order {
  id: string
  status: 'CREATED' | 'PAID' | 'DELIVERY' | 'FINISHED'
  createdAt: string
  itemsQuantity: number
  itemsTotalPrice: number
  items: OrderItem[]
  deliveryAddress?: OrderAddress
}

export interface CreateOrderRequest {
  recipientName: string
  recipientSurname: string
  recipientPhone?: string
  address: Required<OrderAddress>
}
