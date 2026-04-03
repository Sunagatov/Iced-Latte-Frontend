import {
  getTokenFromBrowserCookie,
  removeTokenFromBrowserCookie,
  isTokenExpired,
} from '../../../src/shared/utils/authToken'

function makeJwt(payload: Record<string, unknown>): string {
  const encode = (obj: Record<string, unknown>) =>
    Buffer.from(JSON.stringify(obj)).toString('base64url')
  return `${encode({ alg: 'HS256' })}.${encode(payload)}.sig`
}

describe('getTokenFromBrowserCookie', () => {
  it('returns null when cookie not found', () => {
    Object.defineProperty(document, 'cookie', { value: 'other=abc', writable: true, configurable: true })
    expect(getTokenFromBrowserCookie()).toBeNull()
  })

  it('returns decoded token value', () => {
    Object.defineProperty(document, 'cookie', { value: 'token=hello%20world', writable: true, configurable: true })
    expect(getTokenFromBrowserCookie()).toBe('hello world')
  })

  it('uses custom cookie name', () => {
    Object.defineProperty(document, 'cookie', { value: 'mytoken=abc123', writable: true, configurable: true })
    expect(getTokenFromBrowserCookie('mytoken')).toBe('abc123')
  })
})

describe('removeTokenFromBrowserCookie', () => {
  it('sets cookie with Max-Age=0', () => {
    const values: string[] = []
    Object.defineProperty(document, 'cookie', {
      get: () => '',
      set: (v: string) => values.push(v),
      configurable: true,
    })
    removeTokenFromBrowserCookie()
    expect(values[0]).toContain('Max-Age=0')
  })
})

describe('isTokenExpired', () => {
  it('returns true for null/undefined', () => {
    expect(isTokenExpired(null)).toBe(true)
    expect(isTokenExpired(undefined)).toBe(true)
  })

  it('returns true for malformed token', () => {
    expect(isTokenExpired('not.a.token')).toBe(true)
  })

  it('returns true for expired token', () => {
    const token = makeJwt({ exp: Math.floor(Date.now() / 1000) - 100 })
    expect(isTokenExpired(token)).toBe(true)
  })

  it('returns false for valid token', () => {
    const token = makeJwt({ exp: Math.floor(Date.now() / 1000) + 3600 })
    expect(isTokenExpired(token)).toBe(false)
  })

  it('returns true when exp is missing', () => {
    const token = makeJwt({ sub: 'user' })
    expect(isTokenExpired(token)).toBe(true)
  })
})
