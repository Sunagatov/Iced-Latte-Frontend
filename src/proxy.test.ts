/** @jest-environment node */
import { NextRequest } from 'next/server'
import { proxy } from './proxy'
describe('recovery URL privacy', () => {
  it('keeps production recovery cookies Secure behind an HTTP reverse-proxy hop', () => {
    const env = process.env as Record<string,string|undefined>
    const previous = env.NODE_ENV

    try {
      env.NODE_ENV = 'production'
      const response = proxy(new NextRequest('http://iced-latte.uk/resetpass?token='+'A'.repeat(43)))

      expect(response.cookies.get('password_recovery')?.secure).toBe(true)
    } finally { env.NODE_ENV = previous }
  })

  it('redirects before rendering and stores the token only in a short-lived HttpOnly cookie', () => {
    const token = 'A'.repeat(43)
    const response = proxy(
      new NextRequest('https://iced-latte.uk/resetpass?token=' + token),
    )

    expect(response.status).toBe(303)
    expect(response.headers.get('location')).toBe(
      'https://iced-latte.uk/resetpass?recovery=1',
    )
    const cookie = response.cookies.get('password_recovery')

    expect(cookie).toMatchObject({
      value: token,
      httpOnly: true,
      secure: true,
      maxAge: 300,
      sameSite: 'lax',
    })
    expect(response.headers.get('cache-control')).toBe('no-store')
    expect(response.headers.get('referrer-policy')).toBe('no-referrer')
  })
  it('drops malformed token URLs without retaining attacker-controlled credentials', () => {
    const response = proxy(
      new NextRequest('https://iced-latte.uk/resetpass?token=bad'),
    )

    expect(response.headers.get('location')).toBe(
      'https://iced-latte.uk/resetpass',
    )
    expect(response.cookies.get('password_recovery')).toBeUndefined()
  })
})
