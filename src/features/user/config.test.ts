describe('user config', () => {
  const originalEnv = process.env

  afterEach(() => {
    process.env = originalEnv
    jest.resetModules()
  })

  it('avatarTurnstileEnabled is true when avatar Turnstile and site key are configured', async () => {
    process.env = {
      ...originalEnv,
      NEXT_PUBLIC_TURNSTILE_SITE_KEY: 'site-key',
      NEXT_PUBLIC_TURNSTILE_AVATAR_ENABLED: 'true',
    }

    const { avatarTurnstileEnabled } = await import('@/features/user/config')

    expect(avatarTurnstileEnabled).toBe(true)
  })

  it('avatarTurnstileEnabled is false when avatar Turnstile is disabled', async () => {
    process.env = {
      ...originalEnv,
      NEXT_PUBLIC_TURNSTILE_SITE_KEY: 'site-key',
      NEXT_PUBLIC_TURNSTILE_AVATAR_ENABLED: 'false',
    }

    const { avatarTurnstileEnabled } = await import('@/features/user/config')

    expect(avatarTurnstileEnabled).toBe(false)
  })

  it('avatarTurnstileEnabled is false when the site key is missing', async () => {
    process.env = {
      ...originalEnv,
      NEXT_PUBLIC_TURNSTILE_SITE_KEY: '',
      NEXT_PUBLIC_TURNSTILE_AVATAR_ENABLED: 'true',
    }

    const { avatarTurnstileEnabled } = await import('@/features/user/config')

    expect(avatarTurnstileEnabled).toBe(false)
  })
})
