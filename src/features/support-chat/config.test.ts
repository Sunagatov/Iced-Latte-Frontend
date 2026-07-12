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

  it('allows every authenticated user when support chat allowlist is empty', async () => {
    process.env = {
      ...originalEnv,
      NEXT_PUBLIC_SUPPORT_CHAT_ALLOWED_EMAILS: '',
    }

    const { isSupportChatAllowedEmail, supportChatAllowedEmails } = await import(
      '@/features/support-chat/config'
    )

    expect(supportChatAllowedEmails).toEqual([])
    expect(isSupportChatAllowedEmail('olivia@example.com')).toBe(true)
  })

  it('matches support chat allowlisted emails case-insensitively', async () => {
    process.env = {
      ...originalEnv,
      NEXT_PUBLIC_SUPPORT_CHAT_ALLOWED_EMAILS:
        ' olivia@example.com, SUPPORT@example.com ',
    }

    const { isSupportChatAllowedEmail, supportChatAllowedEmails } = await import(
      '@/features/support-chat/config'
    )

    expect(supportChatAllowedEmails).toEqual([
      'olivia@example.com',
      'support@example.com',
    ])
    expect(isSupportChatAllowedEmail('SUPPORT@example.com')).toBe(true)
    expect(isSupportChatAllowedEmail('guest@example.com')).toBe(false)
  })
})
