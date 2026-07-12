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

  it('accepts Stripe hosted checkout URLs with query or fragment data', () => {
    expect(
      isHostedCheckoutUrl(
        'https://checkout.stripe.com/c/pay/cs_test?client_reference_id=o1#fidkdWxOYHwn',
      ),
    ).toBe(true)
  })

  it('rejects non-Stripe checkout URLs', () => {
    expect(isHostedCheckoutUrl('https://evil.example/pay')).toBe(false)
  })

  it('rejects Stripe checkout domain URLs outside the hosted checkout path', () => {
    expect(isHostedCheckoutUrl('https://checkout.stripe.com/login')).toBe(false)
  })

  it('rejects Stripe-looking subdomains on another origin', () => {
    expect(isHostedCheckoutUrl('https://checkout.stripe.com.evil.example/c/pay')).toBe(
      false,
    )
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
