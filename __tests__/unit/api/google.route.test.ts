/**
 * @jest-environment node
 */
import { NextRequest } from 'next/server'

process.env.NEXT_PUBLIC_API_URL = 'http://backend'
process.env.NEXT_PUBLIC_FRONTEND_URL = 'https://iced-latte.uk'

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
      GET = require('../../../src/app/api/auth/google/route').GET
    })

    return GET!
  }

  it('returns 400 for invalid next path', async () => {
    const res = await getRoute()(makeRequest('https://evil.com'))

    expect(res.status).toBe(400)
  })

  it('redirects to google when backend returns google location', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      status: 302,
      headers: new Headers({
        location: 'https://accounts.google.com/o/oauth2/auth?foo=bar',
      }),
    })

    const res = await getRoute()(makeRequest('/orders'))

    expect(res.status).toBe(307)
    expect(res.headers.get('location')).toContain('google.com')
  })

  it('returns backend status when location is not present', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      status: 500,
      headers: new Headers({}),
    })

    const res = await getRoute()(makeRequest('/orders'))

    expect(res.status).toBe(500)
  })

  it('returns 502 when backend location is not google', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      status: 302,
      headers: new Headers({ location: 'https://evil.com/auth' }),
    })

    const res = await getRoute()(makeRequest('/orders'))

    expect(res.status).toBe(502)
  })

  it('handles missing next', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      status: 302,
      headers: new Headers({ location: 'https://accounts.google.com/auth' }),
    })

    const res = await getRoute()(makeRequest())

    expect(res.status).toBe(307)
  })
})
