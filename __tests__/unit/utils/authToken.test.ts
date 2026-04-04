import { isTokenExpired } from '../../../src/shared/utils/authToken'

function makeJwt(payload: Record<string, unknown>): string {
  const encode = (obj: Record<string, unknown>) =>
    Buffer.from(JSON.stringify(obj)).toString('base64url')
  return `${encode({ alg: 'HS256' })}.${encode(payload)}.sig`
}

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
