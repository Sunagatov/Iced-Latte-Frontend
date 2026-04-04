/**
 * @jest-environment node
 */
import { NextRequest } from 'next/server'

process.env.NEXT_PUBLIC_API_URL = 'http://backend'

function makeRequest(redirectUrl?: string): NextRequest {
  const url = redirectUrl
    ? `http://localhost/api/auth/google?redirectUrl=${encodeURIComponent(redirectUrl)}`
    : 'http://localhost/api/auth/google'

  return new NextRequest(url)
}

describe('google auth route — disallowed origin', () => {
  it('returns 400 for disallowed redirect origin', async () => {
    process.env.ALLOWED_REDIRECT_ORIGINS = 'https://iced-latte.uk'
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let routeModule: any

    jest.isolateModules(() => {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      routeModule = require('../../../src/app/api/auth/google/route')
    })
    const res = await (routeModule.GET as (req: NextRequest) => Promise<Response>)(makeRequest('https://evil.com'))

    expect(res.status).toBe(400)
  })
})

describe('google auth route — allowed origin', () => {
  beforeAll(() => {
    process.env.ALLOWED_REDIRECT_ORIGINS = 'http://localhost:3000,https://iced-latte.uk'
  })

  afterEach(() => jest.restoreAllMocks())

  function getRoute() {
    let GET: (req: NextRequest) => Promise<Response>

    jest.isolateModules(() => {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      GET = require('../../../src/app/api/auth/google/route').GET
    })

    return GET!
  }

  it('redirects to google when backend returns google location', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      status: 302,
      headers: new Headers({ location: 'https://accounts.google.com/o/oauth2/auth?foo=bar' }),
    })
    const res = await getRoute()(makeRequest('http://localhost:3000'))

    expect(res.status).toBe(307)
    expect(res.headers.get('location')).toContain('google.com')
  })

  it('returns backend status when location is not google', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      status: 500,
      headers: new Headers({}),
    })
    const res = await getRoute()(makeRequest('http://localhost:3000'))

    expect(res.status).toBe(500)
  })

  it('handles missing redirectUrl (empty string is allowed)', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      status: 302,
      headers: new Headers({ location: 'https://accounts.google.com/auth' }),
    })
    const res = await getRoute()(makeRequest())

    expect(res.status).toBe(307)
  })
})
