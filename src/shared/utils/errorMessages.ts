import axios, { AxiosError } from 'axios'
import { ErrorResponse } from '@/shared/types/ErrorResponse'

const ERROR_MESSAGES: Record<string, string> = {
  // Auth & Security
  'https://iced-latte.uk/errors/invalid-credentials': 'The email or password you entered is incorrect.',
  'https://iced-latte.uk/errors/auth-required': 'Please sign in to continue.',
  'https://iced-latte.uk/errors/session-expired': 'Your session expired. Please sign in again.',
  'https://iced-latte.uk/errors/account-locked': 'Your account has been locked. Please contact support.',
  'https://iced-latte.uk/errors/access-denied': 'You do not have permission to perform this action.',
  'https://iced-latte.uk/errors/registration-failed': 'This email is already registered. Please sign in.',
  'https://iced-latte.uk/errors/user-not-found': 'User not found.',
  'https://iced-latte.uk/errors/session-not-found': 'Your session could not be found. Please sign in again.',
  'https://iced-latte.uk/errors/session-access-denied': 'You do not have access to this session.',

  // Orders
  'https://iced-latte.uk/errors/order-not-found': "We couldn't find this order.",
  'https://iced-latte.uk/errors/order-access-denied': 'You do not have permission to access this order.',
  'https://iced-latte.uk/errors/order-state-invalid': 'This order can no longer be modified.',
  'https://iced-latte.uk/errors/order-cancellation-expired': 'The cancellation window for this order has passed.',

  // Cart
  'https://iced-latte.uk/errors/cart-not-found': 'Your shopping cart could not be found.',
  'https://iced-latte.uk/errors/cart-item-not-found': 'This item is no longer in your cart.',

  // Products & Reviews
  'https://iced-latte.uk/errors/product-not-found': 'This product is no longer available.',
  'https://iced-latte.uk/errors/review-moderation-failed': 'Your review could not be published — it may contain inappropriate content.',

  // Validation & Generic
  'https://iced-latte.uk/errors/validation-failed': 'Please check the form for errors.',
  'https://iced-latte.uk/errors/file-too-large': 'The file you selected is too large.',
  'https://iced-latte.uk/errors/rate-limited': 'Too many requests. Please wait a moment and try again.',

  // Payment
  'https://iced-latte.uk/errors/payment-session-failed': "We couldn't process your payment. Please try again.",
}

export function getUserMessage(error: unknown): string {
  if (!axios.isAxiosError(error) || !error.response) {
    return 'Network error. Please check your connection.'
  }
  const data = (error as AxiosError<ErrorResponse>).response?.data

  if (data?.type && ERROR_MESSAGES[data.type]) {
    return ERROR_MESSAGES[data.type]
  }

  return data?.detail || data?.message || data?.error || 'Something went wrong. Please try again.'
}
