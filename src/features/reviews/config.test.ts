describe('reviews config', () => {
  const originalEnv = process.env

  afterEach(() => {
    process.env = originalEnv
    jest.resetModules()
  })

  it('reviewsTurnstileEnabled is true when review Turnstile and site key are configured', async () => {
    process.env = {
      ...originalEnv,
      NEXT_PUBLIC_TURNSTILE_SITE_KEY: 'site-key',
      NEXT_PUBLIC_TURNSTILE_REVIEWS_ENABLED: 'true',
    }

    const { reviewsTurnstileEnabled } = await import('@/features/reviews/config')

    expect(reviewsTurnstileEnabled).toBe(true)
  })

  it('reviewsTurnstileEnabled is false when review Turnstile is disabled', async () => {
    process.env = {
      ...originalEnv,
      NEXT_PUBLIC_TURNSTILE_SITE_KEY: 'site-key',
      NEXT_PUBLIC_TURNSTILE_REVIEWS_ENABLED: 'false',
    }

    const { reviewsTurnstileEnabled } = await import('@/features/reviews/config')

    expect(reviewsTurnstileEnabled).toBe(false)
  })

  it('reviewsTurnstileEnabled is false when the site key is missing', async () => {
    process.env = {
      ...originalEnv,
      NEXT_PUBLIC_TURNSTILE_SITE_KEY: '',
      NEXT_PUBLIC_TURNSTILE_REVIEWS_ENABLED: 'true',
    }

    const { reviewsTurnstileEnabled } = await import('@/features/reviews/config')

    expect(reviewsTurnstileEnabled).toBe(false)
  })
})
