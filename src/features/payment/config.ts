import { FEATURES } from '@/shared/config/features'
import axios, { type AxiosError } from 'axios'
import type { ErrorResponse } from '@/shared/types/ErrorResponse'
import { getUserMessage } from '@/shared/utils/errorMessages'

// Stripe checkout is only enabled when explicitly set to 'true'.
// Local and local-Docker builds stay disabled by default.
export const hostedCheckoutEnabled = FEATURES.stripe

export function getCheckoutUnavailableMessage(): string {
  return hostedCheckoutEnabled
    ? 'Could not start checkout. Please try again.'
    : 'Checkout is unavailable in this environment. Enable Stripe checkout and reload the app.'
}

export function getCheckoutErrorMessage(error: unknown): string {
  if (!hostedCheckoutEnabled) {
    return getCheckoutUnavailableMessage()
  }

  if (!axios.isAxiosError(error)) {
    return getCheckoutUnavailableMessage()
  }

  const axiosError = error as AxiosError<ErrorResponse>
  const status = axiosError.response?.status
  const fieldErrors = axiosError.response?.data?.errors

  if (status === 404) {
    return 'Checkout is enabled in the frontend, but the backend payment endpoint is unavailable. Check payment configuration and try again.'
  }

  if (fieldErrors && fieldErrors.length > 0) {
    return fieldErrors.map(({ message }) => message).join(' ')
  }

  return getUserMessage(error)
}
