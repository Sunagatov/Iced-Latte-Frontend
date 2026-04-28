/// <reference types="jest" />
import {
  hasRecoverableSession,
  isTokenExpired,
  isTokenUsable,
} from '@/shared/utils/authToken'

function makeJwt(payload: Record<string, unknown>): string {
  const encode = (obj: Record<string, unknown>) =>
    btoa(JSON.stringify(obj))
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/g, '')

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

describe('isTokenUsable', () => {
  it('returns false for expired tokens', () => {
    const token = makeJwt({ exp: Math.floor(Date.now() / 1000) - 100 })

    expect(isTokenUsable(token)).toBe(false)
  })

  it('returns true for unexpired tokens', () => {
    const token = makeJwt({ exp: Math.floor(Date.now() / 1000) + 3600 })

    expect(isTokenUsable(token)).toBe(true)
  })
})

describe('hasRecoverableSession', () => {
  it('returns true when the access token is usable', () => {
    const accessToken = makeJwt({ exp: Math.floor(Date.now() / 1000) + 3600 })
    const refreshToken = makeJwt({ exp: Math.floor(Date.now() / 1000) - 100 })

    expect(hasRecoverableSession(accessToken, refreshToken)).toBe(true)
  })

  it('returns true when only the refresh token is usable', () => {
    const accessToken = makeJwt({ exp: Math.floor(Date.now() / 1000) - 100 })
    const refreshToken = makeJwt({ exp: Math.floor(Date.now() / 1000) + 3600 })

    expect(hasRecoverableSession(accessToken, refreshToken)).toBe(true)
  })

  it('returns false when both tokens are unusable', () => {
    const accessToken = makeJwt({ exp: Math.floor(Date.now() / 1000) - 100 })
    const refreshToken = makeJwt({ exp: Math.floor(Date.now() / 1000) - 100 })

    expect(hasRecoverableSession(accessToken, refreshToken)).toBe(false)
  })
})
