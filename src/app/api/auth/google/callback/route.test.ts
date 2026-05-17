/**
 * @jest-environment node
 */
import { NextRequest } from 'next/server'

process.env.NEXT_PUBLIC_FRONTEND_URL = 'https://iced-latte.uk'

describe('google callback route', () => {
  function getRoute() {
    let handlers: {
      GET: (req: NextRequest) => Promise<Response>
      POST: (req: NextRequest) => Promise<Response>
    }

    jest.isolateModules(() => {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      handlers = require('@/app/api/auth/google/callback/route')
    })

    return handlers!
  }

  it('returns 400 when POST body is missing tokens', async () => {
    const request = new NextRequest('http://localhost/api/auth/google/callback', {
      method: 'POST',
      body: JSON.stringify({ token: 'only-access-token' }),
      headers: { 'Content-Type': 'application/json' },
    })

    const response = await getRoute().POST(request)

    expect(response.status).toBe(400)
  })

  it('sets auth cookies when POST body has both tokens', async () => {
    const request = new NextRequest('http://localhost/api/auth/google/callback', {
      method: 'POST',
      body: JSON.stringify({ token: 'jwt-token', refreshToken: 'refresh-token' }),
      headers: { 'Content-Type': 'application/json' },
    })

    const response = await getRoute().POST(request)
    const setCookie = response.headers.getSetCookie()

    expect(response.status).toBe(200)
    expect(setCookie.some((value) => value.includes('token=jwt-token'))).toBe(true)
    expect(
      setCookie.some((value) => value.includes('refreshToken=refresh-token')),
    ).toBe(true)
  })

  it('supports legacy GET callbacks with query parameters', async () => {
    const request = new NextRequest(
      'http://localhost/api/auth/google/callback?token=jwt-token&refreshToken=refresh-token',
    )

    const response = await getRoute().GET(request)
    const setCookie = response.headers.getSetCookie()

    expect(response.status).toBe(200)
    expect(setCookie.some((value) => value.includes('token=jwt-token'))).toBe(true)
    expect(
      setCookie.some((value) => value.includes('refreshToken=refresh-token')),
    ).toBe(true)
  })

  it('redirects to signin when legacy GET callback is missing tokens', async () => {
    const request = new NextRequest('http://localhost/api/auth/google/callback')

    const response = await getRoute().GET(request)

    expect(response.status).toBe(302)
    expect(response.headers.get('location')).toBe(
      'https://iced-latte.uk/signin?error=auth_failed',
    )
  })

  it('preserves a safe next value when legacy GET callback is missing tokens', async () => {
    const request = new NextRequest(
      'http://localhost/api/auth/google/callback?next=%2Fcheckout%3Fcoupon%3DSAVE10',
    )

    const response = await getRoute().GET(request)

    expect(response.status).toBe(302)
    expect(response.headers.get('location')).toBe(
      'https://iced-latte.uk/signin?error=auth_failed&next=%2Fcheckout%3Fcoupon%3DSAVE10',
    )
  })
})
