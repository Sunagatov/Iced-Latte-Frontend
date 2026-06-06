/**
 * @jest-environment node
 */
import { NextRequest } from 'next/server'

const originalApiUrl = process.env.NEXT_PUBLIC_API_URL
const originalFrontendUrl = process.env.NEXT_PUBLIC_FRONTEND_URL

function restoreEnv(name: string, value: string | undefined): void {
  if (value === undefined) {
    delete process.env[name]

    return
  }

  process.env[name] = value
}

function makeRequest(next?: string): NextRequest {
  const url = next
    ? `http://localhost/api/auth/google?next=${encodeURIComponent(next)}`
    : 'http://localhost/api/auth/google'

  return new NextRequest(url)
}

describe('google auth route', () => {
  beforeEach(() => {
    process.env.NEXT_PUBLIC_API_URL = 'http://backend'
    process.env.NEXT_PUBLIC_FRONTEND_URL = 'https://frontend.example'
  })

  afterAll(() => {
    restoreEnv('NEXT_PUBLIC_API_URL', originalApiUrl)
    restoreEnv('NEXT_PUBLIC_FRONTEND_URL', originalFrontendUrl)
  })

  function getRoute() {
    let GET: (req: NextRequest) => Promise<Response>

    jest.isolateModules(() => {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      GET = require('@/app/api/auth/google/route').GET
    })

    return GET!
  }

  it('returns 400 for invalid next path', async () => {
    const res = await getRoute()(makeRequest('https://evil.com'))

    expect(res.status).toBe(400)
  })

  it('allows safe next values with query strings', async () => {
    const res = await getRoute()(makeRequest('/checkout?coupon=SAVE10'))
    const location = new URL(res.headers.get('location')!)

    expect(res.status).toBe(307)
    expect(location.toString()).toContain('/auth/oauth/google')
    expect(location.searchParams.get('redirectUrl')).toBe(
      'https://frontend.example/auth/google/callback?next=%2Fcheckout%3Fcoupon%3DSAVE10',
    )
  })

  it('redirects the browser to backend oauth initiation', async () => {
    const res = await getRoute()(makeRequest('/orders'))
    const location = new URL(res.headers.get('location')!)

    expect(res.status).toBe(307)
    expect(location.toString()).toContain('/auth/oauth/google')
    expect(location.searchParams.get('redirectUrl')).toBe(
      'https://frontend.example/auth/google/callback?next=%2Forders',
    )
  })

  it('handles missing next', async () => {
    const res = await getRoute()(makeRequest())
    const location = new URL(res.headers.get('location')!)

    expect(res.status).toBe(307)
    expect(location.searchParams.get('redirectUrl')).toBe(
      'https://frontend.example/auth/google/callback',
    )
  })

  it('falls back to the request origin when frontend URL is not configured', async () => {
    delete process.env.NEXT_PUBLIC_FRONTEND_URL

    const res = await getRoute()(makeRequest('/orders'))
    const location = new URL(res.headers.get('location')!)
    const redirectUrl = location.searchParams.get('redirectUrl')

    expect(res.status).toBe(307)
    expect(redirectUrl).toBe('http://localhost/auth/google/callback?next=%2Forders')
  })

  it('builds the backend OAuth URL when the API URL has a trailing slash', async () => {
    process.env.NEXT_PUBLIC_API_URL = 'http://backend/api/v1/'

    const res = await getRoute()(makeRequest('/orders'))
    const location = new URL(res.headers.get('location')!)

    expect(res.status).toBe(307)
    expect(location.toString()).toContain('http://backend/api/v1/auth/oauth/google')
  })

  it('returns 500 when backend API URL is not configured', async () => {
    delete process.env.NEXT_PUBLIC_API_URL

    const res = await getRoute()(makeRequest('/orders'))

    expect(res.status).toBe(500)
    expect(await res.json()).toEqual({ error: 'Google OAuth is not configured' })
  })

  it('returns 500 when backend API URL is invalid', async () => {
    process.env.NEXT_PUBLIC_API_URL = 'not a url'

    const res = await getRoute()(makeRequest('/orders'))

    expect(res.status).toBe(500)
    expect(await res.json()).toEqual({ error: 'Google OAuth is not configured' })
  })
})
