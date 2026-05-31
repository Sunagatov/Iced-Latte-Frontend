import { isHttpsFrontend, secureCookieSuffix } from '@/shared/config/runtime'

describe('runtime security config', () => {
  const originalEnv = process.env

  afterEach(() => {
    process.env = originalEnv
  })

  it('uses secure cookies in production even when the public URL is missing', () => {
    process.env = {
      ...originalEnv,
      NODE_ENV: 'production',
      NEXT_PUBLIC_FRONTEND_URL: '',
    }

    expect(isHttpsFrontend()).toBe(true)
    expect(secureCookieSuffix()).toBe('; Secure')
  })

  it('allows non-secure cookies for local non-production HTTP URLs', () => {
    process.env = {
      ...originalEnv,
      NODE_ENV: 'development',
      NEXT_PUBLIC_FRONTEND_URL: 'http://localhost:3000',
    }

    expect(isHttpsFrontend()).toBe(false)
    expect(secureCookieSuffix()).toBe('')
  })
})
