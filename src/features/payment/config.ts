import { FEATURES } from '@/shared/config/features'

// Stripe checkout is only enabled when explicitly set to 'true'.
// Local and local-Docker builds stay disabled by default.
export const hostedCheckoutEnabled = FEATURES.stripe

export function getCheckoutUnavailableMessage(): string {
  return hostedCheckoutEnabled
    ? 'Could not start checkout. Please try again.'
    : 'Checkout is unavailable in this environment. Enable Stripe checkout and reload the app.'
}
