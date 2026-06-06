import {
  createCheckout as createGeneratedCheckout,
  getCheckoutStatus as getGeneratedCheckoutStatus,
} from '@/shared/api/generated/payment'

export interface CreateCheckoutRequest {
  recipientName: string
  recipientSurname: string
  recipientPhone?: string
  deliveryAddressId?: string
  turnstileToken?: string
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
  return createGeneratedCheckout(payload, { 'Idempotency-Key': idempotencyKey })
}

export async function getCheckoutStatus(
  orderId: string,
  signal?: AbortSignal,
): Promise<CheckoutStatus> {
  const options = { cache: false, signal }

  return getGeneratedCheckoutStatus(encodeURIComponent(orderId), options)
}
