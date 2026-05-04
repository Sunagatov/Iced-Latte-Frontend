// Stripe checkout is only enabled when explicitly set to 'true'.
// This is a test-mode educational project — never enable by default.
export const hostedCheckoutEnabled =
  process.env.NEXT_PUBLIC_STRIPE_ENABLED === 'true'

export function getCheckoutUnavailableMessage(): string {
  return hostedCheckoutEnabled
    ? 'Could not start checkout. Please try again.'
    : 'Checkout is unavailable in this environment. Enable Stripe checkout and reload the app.'
}
