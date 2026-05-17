describe('payment config', () => {
  const originalEnv = process.env

  afterEach(() => {
    process.env = originalEnv
    jest.resetModules()
  })

  it('hostedCheckoutEnabled is true when NEXT_PUBLIC_STRIPE_ENABLED=true', async () => {
    process.env = { ...originalEnv, NEXT_PUBLIC_STRIPE_ENABLED: 'true' }
    const { hostedCheckoutEnabled } = await import('@/features/payment/config')

    expect(hostedCheckoutEnabled).toBe(true)
  })

  it('hostedCheckoutEnabled is false when NEXT_PUBLIC_STRIPE_ENABLED=false', async () => {
    process.env = { ...originalEnv, NEXT_PUBLIC_STRIPE_ENABLED: 'false' }
    const { hostedCheckoutEnabled } = await import('@/features/payment/config')

    expect(hostedCheckoutEnabled).toBe(false)
  })

  it('hostedCheckoutEnabled is false when NEXT_PUBLIC_STRIPE_ENABLED is missing', async () => {
    const { NEXT_PUBLIC_STRIPE_ENABLED: _, ...envWithout } = originalEnv

    process.env = { ...envWithout, NODE_ENV: 'development' }
    const { hostedCheckoutEnabled } = await import('@/features/payment/config')

    expect(hostedCheckoutEnabled).toBe(false)
  })

  it('hostedCheckoutEnabled is false in production when NEXT_PUBLIC_STRIPE_ENABLED is missing', async () => {
    const { NEXT_PUBLIC_STRIPE_ENABLED: _, ...envWithout } = originalEnv

    process.env = { ...envWithout, NODE_ENV: 'production' }
    const { hostedCheckoutEnabled } = await import('@/features/payment/config')

    expect(hostedCheckoutEnabled).toBe(false)
  })

  it('hostedCheckoutEnabled is false in production when NEXT_PUBLIC_STRIPE_ENABLED=false', async () => {
    process.env = {
      ...originalEnv,
      NODE_ENV: 'production',
      NEXT_PUBLIC_STRIPE_ENABLED: 'false',
    }
    const { hostedCheckoutEnabled } = await import('@/features/payment/config')

    expect(hostedCheckoutEnabled).toBe(false)
  })

  it('getCheckoutUnavailableMessage returns disabled message when checkout is off', async () => {
    process.env = { ...originalEnv, NEXT_PUBLIC_STRIPE_ENABLED: 'false' }
    const { getCheckoutUnavailableMessage } = await import('@/features/payment/config')

    expect(getCheckoutUnavailableMessage()).toContain('unavailable')
  })
})
