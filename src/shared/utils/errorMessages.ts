import axios, { AxiosError } from 'axios'
import { ErrorResponse } from '@/shared/types/ErrorResponse'

const ERROR_MESSAGES: Record<string, string> = {
  // Auth & Security
  'invalid-credentials': 'The email or password you entered is incorrect.',
  'auth-required': 'Please sign in to continue.',
  'session-expired': 'Your session expired. Please sign in again.',
  'account-locked': 'Your account has been locked. Please contact support.',
  'access-denied': 'You do not have permission to perform this action.',
  'registration-failed': 'This email is already registered. Please sign in.',
  'user-not-found': 'User not found.',
  'session-not-found': 'Your session could not be found. Please sign in again.',
  'session-access-denied': 'You do not have access to this session.',

  // Orders
  'order-not-found': "We couldn't find this order.",
  'order-access-denied': 'You do not have permission to access this order.',
  'order-state-invalid': 'This order can no longer be modified.',
  'order-cancellation-expired': 'The cancellation window for this order has passed.',

  // Cart
  'cart-not-found': 'Your shopping cart could not be found.',
  'cart-item-not-found': 'This item is no longer in your cart.',

  // Products & Reviews
  'product-not-found': 'This product is no longer available.',
  'review-moderation-failed': 'Your review could not be published — it may contain inappropriate content.',

  // Validation & Generic
  'validation-failed': 'Please check the form for errors.',
  'file-too-large': 'The file you selected is too large.',
  'rate-limited': 'Too many requests. Please wait a moment and try again.',

  // Payment
  'payment-session-failed': "We couldn't process your payment. Please try again.",
}

function errorTypeSlug(type: string): string {
  try {
    const pathname = new URL(type).pathname
    return pathname.split('/').filter(Boolean).at(-1) ?? type
  } catch {
    return type.split('/').filter(Boolean).at(-1) ?? type
  }
}

export function getUserMessage(error: unknown): string {
  if (!axios.isAxiosError(error) || !error.response) {
    return 'Network error. Please check your connection.'
  }
  const data = (error as AxiosError<ErrorResponse>).response?.data

  const typeSlug = data?.type ? errorTypeSlug(data.type) : undefined

  if (typeSlug && ERROR_MESSAGES[typeSlug]) {
    return ERROR_MESSAGES[typeSlug]
  }

  return data?.detail || data?.message || data?.error || 'Something went wrong. Please try again.'
}
