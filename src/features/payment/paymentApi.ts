import { api } from '@/shared/api/client'

export interface CreateCheckoutRequest {
  recipientName: string
  recipientSurname: string
  recipientPhone?: string
  deliveryAddressId?: string
  address?: {
    country: string
    city: string
    line: string
    postcode: string
  }
}

export interface CheckoutResponse {
  orderId: string
  stripeSessionId: string
  checkoutUrl: string
}

export type PaymentStatusValue =
  | 'CREATED'
  | 'STRIPE_SESSION_CREATED'
  | 'AWAITING_ASYNC_CONFIRMATION'
  | 'PAID'
  | 'FAILED'
  | 'EXPIRED'
  | 'REFUNDED'
  | 'RECONCILIATION_FAILED'

export interface CheckoutStatus {
  orderId: string
  orderStatus: string
  paymentStatus?: PaymentStatusValue
}

export async function createCheckout(
  payload: CreateCheckoutRequest,
  idempotencyKey: string,
): Promise<CheckoutResponse> {
  const response = await api.post<CheckoutResponse>(
    '/payment/checkout',
    payload,
    {
      headers: { 'Idempotency-Key': idempotencyKey },
    },
  )

  return response.data
}

export async function getCheckoutStatus(
  orderId: string,
  signal?: AbortSignal,
): Promise<CheckoutStatus> {
  const response = await api.get<CheckoutStatus>(
    `/payment/checkout/${orderId}/status`,
    { cache: false, signal },
  )

  return response.data
}
