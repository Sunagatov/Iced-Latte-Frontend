import {
  isHostedCheckoutUrl,
  redirectToHostedCheckout,
} from '@/features/checkout/redirect'

describe('checkout redirect', () => {
  it('accepts Stripe hosted checkout URLs', () => {
    expect(isHostedCheckoutUrl('https://checkout.stripe.com/c/pay/cs_test')).toBe(
      true,
    )
  })

  it('rejects non-Stripe checkout URLs', () => {
    expect(isHostedCheckoutUrl('https://evil.example/pay')).toBe(false)
  })

  it('rejects credentialed Stripe URLs', () => {
    expect(isHostedCheckoutUrl('https://user:pass@checkout.stripe.com/pay')).toBe(
      false,
    )
  })

  it('throws before redirecting to an untrusted URL', () => {
    expect(() => redirectToHostedCheckout('javascript:alert(1)')).toThrow(
      'Invalid hosted checkout URL',
    )
  })
})
