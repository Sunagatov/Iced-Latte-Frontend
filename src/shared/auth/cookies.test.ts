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
} from '@/shared/auth/cookies'

describe('cookieUtils', () => {
  beforeEach(() => {
    jest.clearAllMocks()
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
