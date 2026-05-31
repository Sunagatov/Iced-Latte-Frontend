/**
 * @jest-environment node
 */
import { NextRequest } from 'next/server'

const FRONTEND_ORIGIN = 'https://frontend.example'

process.env.NEXT_PUBLIC_FRONTEND_URL = FRONTEND_ORIGIN

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

  it('rejects POST token handoffs', async () => {
    const request = new NextRequest('http://localhost/api/auth/google/callback', {
      method: 'POST',
      body: JSON.stringify({ token: 'jwt-token', refreshToken: 'refresh-token' }),
      headers: { 'Content-Type': 'application/json' },
    })

    const response = await getRoute().POST(request)

    expect(response.status).toBe(410)
    expect(response.headers.getSetCookie()).toEqual([])
  })

  it('redirects legacy GET callbacks with query tokens without setting cookies', async () => {
    const request = new NextRequest(
      'http://localhost/api/auth/google/callback?token=jwt-token&refreshToken=refresh-token',
    )

    const response = await getRoute().GET(request)
    const setCookie = response.headers.getSetCookie()

    expect(response.status).toBe(302)
    expect(response.headers.get('location')).toBe(
      `${FRONTEND_ORIGIN}/signin?error=auth_failed`,
    )
    expect(setCookie).toEqual([])
  })

  it('redirects to signin when legacy GET callback is missing tokens', async () => {
    const request = new NextRequest('http://localhost/api/auth/google/callback')

    const response = await getRoute().GET(request)

    expect(response.status).toBe(302)
    expect(response.headers.get('location')).toBe(
      `${FRONTEND_ORIGIN}/signin?error=auth_failed`,
    )
  })

  it('preserves a safe next value when legacy GET callback is missing tokens', async () => {
    const request = new NextRequest(
      'http://localhost/api/auth/google/callback?next=%2Fcheckout%3Fcoupon%3DSAVE10',
    )

    const response = await getRoute().GET(request)

    expect(response.status).toBe(302)
    expect(response.headers.get('location')).toBe(
      `${FRONTEND_ORIGIN}/signin?error=auth_failed&next=%2Fcheckout%3Fcoupon%3DSAVE10`,
    )
  })
})
