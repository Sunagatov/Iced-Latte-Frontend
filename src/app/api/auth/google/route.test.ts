/**
 * @jest-environment node
 */
import { NextRequest } from 'next/server'

process.env.NEXT_PUBLIC_API_URL = 'http://backend'
process.env.NEXT_PUBLIC_FRONTEND_URL = 'https://frontend.example'

function makeRequest(next?: string): NextRequest {
  const url = next
    ? `http://localhost/api/auth/google?next=${encodeURIComponent(next)}`
    : 'http://localhost/api/auth/google'

  return new NextRequest(url)
}

describe('google auth route', () => {
  afterEach(() => jest.restoreAllMocks())

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
    const originalFrontendUrl = process.env.NEXT_PUBLIC_FRONTEND_URL

    delete process.env.NEXT_PUBLIC_FRONTEND_URL

    const res = await getRoute()(makeRequest('/orders'))
    const location = new URL(res.headers.get('location')!)
    const redirectUrl = location.searchParams.get('redirectUrl')

    process.env.NEXT_PUBLIC_FRONTEND_URL = originalFrontendUrl

    expect(res.status).toBe(307)
    expect(redirectUrl).toBe('http://localhost/auth/google/callback?next=%2Forders')
  })
})
