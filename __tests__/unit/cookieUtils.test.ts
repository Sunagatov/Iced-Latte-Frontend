const setMock = jest.fn()
const getMock = jest.fn()

jest.mock('next/headers', () => ({
  cookies: jest.fn(async () => ({
    set: setMock,
    get: getMock,
  })),
}))

import {
  clearAuthCookies,
  setAuthCookies,
  setCookie,
} from '@/shared/utils/cookieUtils'

describe('cookieUtils', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('persists auth cookies with a 24 hour maxAge', async () => {
    await setAuthCookies('access-token', 'refresh-token')

    expect(setMock).toHaveBeenNthCalledWith(
      1,
      'token',
      'access-token',
      expect.objectContaining({
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 24,
      }),
    )
    expect(setMock).toHaveBeenNthCalledWith(
      2,
      'refreshToken',
      'refresh-token',
      expect.objectContaining({
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 24,
      }),
    )
  })

  it('applies the same persistence policy to generic cookie writes', async () => {
    await setCookie('token', 'value')

    expect(setMock).toHaveBeenCalledWith(
      'token',
      'value',
      expect.objectContaining({
        maxAge: 60 * 60 * 24,
      }),
    )
  })

  it('still clears auth cookies immediately', async () => {
    await clearAuthCookies()

    expect(setMock).toHaveBeenNthCalledWith(
      1,
      'token',
      '',
      expect.objectContaining({ maxAge: 0 }),
    )
    expect(setMock).toHaveBeenNthCalledWith(
      2,
      'refreshToken',
      '',
      expect.objectContaining({ maxAge: 0 }),
    )
  })
})
