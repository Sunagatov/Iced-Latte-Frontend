describe('next security headers', () => {
  const originalEnv = process.env

  afterEach(() => {
    jest.resetModules()
    process.env = originalEnv
  })

  async function contentSecurityPolicyForNodeEnv(nodeEnv) {
    process.env = { ...originalEnv, NODE_ENV: nodeEnv }
    jest.resetModules()

    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const config = require('./next.config')
    const rules = await config.headers()
    const headers = rules[0].headers

    return headers.find((header) => header.key === 'Content-Security-Policy').value
  }

  it('omits unsafe-eval from production CSP', async () => {
    await expect(contentSecurityPolicyForNodeEnv('production')).resolves.not.toContain(
      '\'unsafe-eval\'',
    )
  })

  it('keeps unsafe-eval available outside production for Next.js development', async () => {
    await expect(contentSecurityPolicyForNodeEnv('development')).resolves.toContain(
      '\'unsafe-eval\'',
    )
  })

  it('allows Google Analytics 4 script loading and collection endpoints', async () => {
    const csp = await contentSecurityPolicyForNodeEnv('production')

    expect(csp).toContain('script-src')
    expect(csp).toContain('https://*.googletagmanager.com')
    expect(csp).toContain('img-src')
    expect(csp).toContain('https://*.google-analytics.com')
    expect(csp).toContain('connect-src')
    expect(csp).toContain('https://*.analytics.google.com')
  })
})
