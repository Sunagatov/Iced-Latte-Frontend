const STRIPE_CHECKOUT_ORIGIN = 'https://checkout.stripe.com'

export function isHostedCheckoutUrl(url: string): boolean {
  try {
    const parsed = new URL(url)

    return (
      parsed.origin === STRIPE_CHECKOUT_ORIGIN &&
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
