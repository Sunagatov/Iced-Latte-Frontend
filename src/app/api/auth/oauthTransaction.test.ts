/** @jest-environment node */
import { createHash } from 'node:crypto'
import { redirectWithOAuthTransaction } from './oauthTransaction'
describe('browser-bound OAuth initiation', () => {
  it('sends only the hash challenge while retaining the random verifier in an HttpOnly cookie', () => {
    const response=redirectWithOAuthTransaction(new URL('https://api.example.com/api/v1/auth/oauth/google'))
    const cookie=response.cookies.get('oauth_browser_verifier')!
    const location=new URL(response.headers.get('location')!)

    expect(cookie.value).toMatch(/^[A-Za-z0-9_-]{43}$/)
    expect(cookie).toMatchObject({ httpOnly:true,sameSite:'lax',maxAge:600,path:'/api/proxy/auth/oauth/token' })
    expect(location.searchParams.get('codeChallenge')).toBe(createHash('sha256').update(cookie.value).digest('base64url'))
    expect(location.toString()).not.toContain(cookie.value)
    expect(response.headers.get('cache-control')).toBe('no-store')
  })
})
