const rawCheckoutFlag = process.env.NEXT_PUBLIC_STRIPE_ENABLED

export const hostedCheckoutEnabled =
  rawCheckoutFlag != null
    ? rawCheckoutFlag === 'true'
    : process.env.NODE_ENV !== 'development'

export function getCheckoutUnavailableMessage(): string {
  return hostedCheckoutEnabled
    ? 'Could not start checkout. Please try again.'
    : 'Checkout is unavailable in this environment. Enable Stripe checkout and reload the app.'
}
