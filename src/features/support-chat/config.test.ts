describe('support chat config', () => {
  const originalEnv = process.env

  afterEach(() => {
    process.env = originalEnv
    jest.resetModules()
  })

  it('supportChatEnabled is true only when explicitly enabled', async () => {
    process.env = {
      ...originalEnv,
      NEXT_PUBLIC_SUPPORT_CHAT_ENABLED: 'true',
    }

    const { supportChatEnabled } = await import('@/features/support-chat/config')

    expect(supportChatEnabled).toBe(true)
  })

  it('supportChatEnabled is false by default', async () => {
    const { NEXT_PUBLIC_SUPPORT_CHAT_ENABLED: _, ...envWithout } = originalEnv

    process.env = envWithout

    const { supportChatEnabled } = await import('@/features/support-chat/config')

    expect(supportChatEnabled).toBe(false)
  })

  it('supportChatTurnstileEnabled requires both support chat Turnstile flag and site key', async () => {
    process.env = {
      ...originalEnv,
      NEXT_PUBLIC_TURNSTILE_SITE_KEY: 'site-key',
      NEXT_PUBLIC_TURNSTILE_SUPPORT_CHAT_ENABLED: 'true',
    }

    const { supportChatTurnstileEnabled } = await import(
      '@/features/support-chat/config'
    )

    expect(supportChatTurnstileEnabled).toBe(true)
  })

  it('supportChatTurnstileEnabled is false when site key is missing', async () => {
    process.env = {
      ...originalEnv,
      NEXT_PUBLIC_TURNSTILE_SITE_KEY: '',
      NEXT_PUBLIC_TURNSTILE_SUPPORT_CHAT_ENABLED: 'true',
    }

    const { supportChatTurnstileEnabled } = await import(
      '@/features/support-chat/config'
    )

    expect(supportChatTurnstileEnabled).toBe(false)
  })
})
