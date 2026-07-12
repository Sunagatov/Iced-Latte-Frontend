const STRIPE_CHECKOUT_ORIGIN = 'https://checkout.stripe.com'
const STRIPE_CHECKOUT_PATH_PREFIX = '/c/'

export function isHostedCheckoutUrl(url: string): boolean {
  try {
    const parsed = new URL(url)

    return (
      parsed.origin === STRIPE_CHECKOUT_ORIGIN &&
      parsed.pathname.startsWith(STRIPE_CHECKOUT_PATH_PREFIX) &&
      parsed.username === '' &&
      parsed.password === ''
    )
  } catch {
    return false
  }
}

export function redirectToHostedCheckout(url: string): void {
  if (!isHostedCheckoutUrl(url)) {
    throw new Error('Invalid hosted checkout URL')
  }

  window.location.assign(url)
}
