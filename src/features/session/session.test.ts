import { AxiosError, type AxiosResponse } from 'axios'
import {
  bootstrapClientSession,
  refreshAuthenticatedSession,
} from '@/features/session/session'
import { getUserData } from '@/features/user/public'
import { refreshToken } from '@/shared/api/generated/security'
import { useAuthStore } from '@/features/auth/public'

jest.mock('@/features/user/public', () => ({
  getUserData: jest.fn(),
}))

jest.mock('@/shared/api/generated/security', () => ({
  refreshToken: jest.fn(),
}))

jest.mock('@/features/auth/public', () => ({
  useAuthStore: {
    getState: jest.fn(),
  },
}))

jest.mock('@/features/cart/public', () => ({
  useCartStore: {
    getState: jest.fn(),
    persist: {
      hasHydrated: jest.fn(() => true),
      onFinishHydration: jest.fn(),
    },
  },
}))

jest.mock('@/features/favorites/public', () => ({
  useFavouritesStore: {
    getState: jest.fn(),
    persist: {
      hasHydrated: jest.fn(() => true),
      onFinishHydration: jest.fn(),
    },
  },
}))

jest.mock('@/shared/auth/cookies', () => ({
  clearAuthCookies: jest.fn(),
}))

const mockedGetUserData = jest.mocked(getUserData)
const mockedRefreshToken = jest.mocked(refreshToken)
const mockedUseAuthStore = jest.mocked(useAuthStore)
const setAuthenticated = jest.fn()
const setAnonymous = jest.fn()

function makeAxiosError(status: number): AxiosError {
  const error = new AxiosError('request failed')

  error.response = { status } as AxiosResponse

  return error
}

describe('session orchestration', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockedRefreshToken.mockResolvedValue({} as Awaited<
      ReturnType<typeof refreshToken>
    >)
    mockedUseAuthStore.getState.mockReturnValue({
      setAnonymous,
      setAuthenticated,
    } as unknown as ReturnType<typeof useAuthStore.getState>)
  })

  it('passes retry-skip options through the post-refresh user lookup', async () => {
    const userData = { email: 'user@example.com' }

    mockedGetUserData.mockResolvedValue(userData as Awaited<
      ReturnType<typeof getUserData>
    >)

    await expect(
      refreshAuthenticatedSession({ skipAuthRetry: true }),
    ).resolves.toBe(userData)

    expect(mockedRefreshToken).toHaveBeenCalledWith({ skipAuthRetry: true })
    expect(mockedGetUserData).toHaveBeenCalledWith({ skipAuthRetry: true })
    expect(setAuthenticated).toHaveBeenCalledWith(userData)
  })

  it('does not mark the user anonymous after a non-auth bootstrap failure', async () => {
    mockedGetUserData.mockRejectedValueOnce(makeAxiosError(500))
    mockedRefreshToken.mockRejectedValueOnce(makeAxiosError(500))

    await bootstrapClientSession()

    expect(setAnonymous).not.toHaveBeenCalled()
  })

  it('marks the user anonymous when bootstrap refresh fails with an auth error', async () => {
    mockedGetUserData.mockRejectedValueOnce(makeAxiosError(401))
    mockedRefreshToken.mockRejectedValueOnce(makeAxiosError(401))

    await bootstrapClientSession()

    expect(setAnonymous).toHaveBeenCalledTimes(1)
  })
})
