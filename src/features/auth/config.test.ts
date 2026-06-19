describe('authTurnstileEnabled', () => {
  afterEach(() => {
    jest.resetModules()
  })

  it('is true only when the auth Turnstile flag and site key are configured', async () => {
    jest.doMock('@/shared/config/features', () => ({
      FEATURES: {
        authTurnstile: true,
      },
    }))

    const { authTurnstileEnabled } = await import('@/features/auth/config')

    expect(authTurnstileEnabled).toBe(true)
  })

  it('is false when auth Turnstile is disabled', async () => {
    jest.doMock('@/shared/config/features', () => ({
      FEATURES: {
        authTurnstile: false,
      },
    }))

    const { authTurnstileEnabled } = await import('@/features/auth/config')

    expect(authTurnstileEnabled).toBe(false)
  })
})
