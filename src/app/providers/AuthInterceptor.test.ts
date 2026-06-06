import { render, waitFor } from '@testing-library/react'
import type { AxiosError, AxiosResponse, InternalAxiosRequestConfig } from 'axios'
import { createElement } from 'react'
import AuthInterceptor, {
  getRetryAfterDelayMs,
  isAuthRefreshExcludedRequest,
  isRateLimitRetrySafeRequest,
} from '@/app/providers/AuthInterceptor'
import { api } from '@/shared/api/client'
import {
  clearClientSession,
  refreshAuthenticatedSession,
} from '@/features/session/public'
import { useAuthStore } from '@/features/auth/public'
import { ROUTES } from '@/shared/config/routes'

const routerPush = jest.fn()

type MockApiClient = jest.Mock & {
  request: jest.Mock
  interceptors: {
    response: {
      use: jest.Mock
      eject: jest.Mock
    }
  }
}

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: routerPush,
  }),
}))

jest.mock('@/shared/api/client', () => {
  const mockedApi = jest.fn() as MockApiClient

  mockedApi.request = jest.fn()
  mockedApi.interceptors = {
    response: {
      use: jest.fn(),
      eject: jest.fn(),
    },
  }

  return { api: mockedApi }
})

jest.mock('@/features/session/public', () => ({
  clearClientSession: jest.fn(),
  refreshAuthenticatedSession: jest.fn(),
}))

jest.mock('@/features/auth/public', () => ({
  useAuthStore: {
    getState: jest.fn(),
  },
}))

const mockedApi = api as unknown as MockApiClient
const mockedRefreshAuthenticatedSession = jest.mocked(refreshAuthenticatedSession)
const mockedClearClientSession = jest.mocked(clearClientSession)
const mockedUseAuthStore = jest.mocked(useAuthStore)

function makeAxiosError(
  status: number,
  config: Partial<InternalAxiosRequestConfig> = {},
): AxiosError {
  return {
    config: {
      headers: {},
      method: 'GET',
      url: '/users',
      ...config,
    } as InternalAxiosRequestConfig,
    response: {
      headers: {},
      status,
    } as AxiosResponse,
  } as AxiosError
}

describe('AuthInterceptor URL guards', () => {
  it('matches auth endpoints that should never trigger refresh recursion', () => {
    expect(isAuthRefreshExcludedRequest('/api/proxy/auth/authenticate')).toBe(true)
    expect(isAuthRefreshExcludedRequest('/api/proxy/auth/refresh')).toBe(true)
    expect(isAuthRefreshExcludedRequest('/api/proxy/auth/register')).toBe(true)
    expect(isAuthRefreshExcludedRequest('/api/v1/auth/password/forgot')).toBe(true)
    expect(isAuthRefreshExcludedRequest('/auth/logout')).toBe(true)
    expect(isAuthRefreshExcludedRequest('/api/v1/auth/refresh')).toBe(true)
  })

  it('does not exclude regular application endpoints from refresh handling', () => {
    expect(isAuthRefreshExcludedRequest('/api/proxy/users')).toBe(false)
    expect(isAuthRefreshExcludedRequest('/api/proxy/users/addresses')).toBe(false)
    expect(isAuthRefreshExcludedRequest('/api/proxy/products')).toBe(false)
  })

  it('clamps retry-after delays to a safe browser wait', () => {
    jest.useFakeTimers().setSystemTime(new Date('2026-06-06T12:00:00.000Z'))

    try {
      expect(getRetryAfterDelayMs(undefined)).toBe(5000)
      expect(getRetryAfterDelayMs('2')).toBe(2000)
      expect(getRetryAfterDelayMs('Sat, 06 Jun 2026 12:00:03 GMT')).toBe(3000)
      expect(getRetryAfterDelayMs('120')).toBe(60000)
      expect(getRetryAfterDelayMs('-1')).toBe(5000)
      expect(getRetryAfterDelayMs('not-a-number')).toBe(5000)
    } finally {
      jest.useRealTimers()
    }
  })

  it('only retries rate-limited requests when they are safe or explicitly idempotent', () => {
    expect(isRateLimitRetrySafeRequest('GET')).toBe(true)
    expect(isRateLimitRetrySafeRequest('HEAD')).toBe(true)
    expect(isRateLimitRetrySafeRequest('OPTIONS')).toBe(true)
    expect(isRateLimitRetrySafeRequest('POST')).toBe(false)
    expect(isRateLimitRetrySafeRequest('PATCH')).toBe(false)
    expect(isRateLimitRetrySafeRequest('DELETE')).toBe(false)
    expect(
      isRateLimitRetrySafeRequest('POST', { 'Idempotency-Key': 'request-1' }),
    ).toBe(true)
    expect(
      isRateLimitRetrySafeRequest('PATCH', { 'idempotency-key': 'request-1' }),
    ).toBe(true)
  })
})

describe('AuthInterceptor runtime behavior', () => {
  let rejectResponse: (error: AxiosError) => Promise<unknown>

  beforeEach(() => {
    jest.clearAllMocks()
    mockedApi.interceptors.response.use.mockImplementation((_, onRejected) => {
      if (!onRejected) {
        throw new Error('Expected rejected interceptor callback')
      }

      rejectResponse = onRejected as typeof rejectResponse

      return 7
    })
    mockedApi.interceptors.response.eject.mockImplementation(jest.fn())
    mockedApi.request = jest.fn().mockResolvedValue({ data: 'retried' })
    mockedRefreshAuthenticatedSession.mockResolvedValue({} as Awaited<
      ReturnType<typeof refreshAuthenticatedSession>
    >)
    mockedClearClientSession.mockResolvedValue(undefined)
    mockedUseAuthStore.getState.mockReturnValue({
      status: 'loading',
    } as ReturnType<typeof useAuthStore.getState>)
  })

  it('refreshes the session and retries the original request after a 401', async () => {
    render(createElement(AuthInterceptor, null, createElement('div')))

    await waitFor(() =>
      expect(mockedApi.interceptors.response.use).toHaveBeenCalledTimes(1),
    )

    const originalRequest = {
      headers: {},
      method: 'GET',
      url: '/users',
    } as InternalAxiosRequestConfig

    await expect(rejectResponse(makeAxiosError(401, originalRequest))).resolves.toEqual({
      data: 'retried',
    })

    expect(mockedRefreshAuthenticatedSession).toHaveBeenCalledTimes(1)
    expect(mockedApi.request).toHaveBeenCalledWith(
      expect.objectContaining({
        isAuthRetry: true,
        url: '/users',
      }),
    )
  })

  it('clears the client session and redirects to signin when refresh fails', async () => {
    mockedRefreshAuthenticatedSession.mockRejectedValue(new Error('refresh failed'))

    render(createElement(AuthInterceptor, null, createElement('div')))

    await waitFor(() =>
      expect(mockedApi.interceptors.response.use).toHaveBeenCalledTimes(1),
    )

    await expect(rejectResponse(makeAxiosError(401))).rejects.toThrow('refresh failed')

    expect(mockedClearClientSession).toHaveBeenCalledTimes(1)
    expect(routerPush).toHaveBeenCalledWith(ROUTES.signin)
    expect(mockedApi.request).not.toHaveBeenCalled()
  })

  it('does not refresh when the auth store already knows the visitor is anonymous', async () => {
    mockedUseAuthStore.getState.mockReturnValue({
      status: 'anonymous',
    } as ReturnType<typeof useAuthStore.getState>)

    render(createElement(AuthInterceptor, null, createElement('div')))

    await waitFor(() =>
      expect(mockedApi.interceptors.response.use).toHaveBeenCalledTimes(1),
    )

    await expect(rejectResponse(makeAxiosError(401))).rejects.toMatchObject({
      response: { status: 401 },
    })

    expect(mockedRefreshAuthenticatedSession).not.toHaveBeenCalled()
    expect(mockedApi.request).not.toHaveBeenCalled()
  })

  it('ejects the response interceptor on unmount', async () => {
    const { unmount } = render(
      createElement(AuthInterceptor, null, createElement('div')),
    )

    await waitFor(() =>
      expect(mockedApi.interceptors.response.use).toHaveBeenCalledTimes(1),
    )

    unmount()

    expect(mockedApi.interceptors.response.eject).toHaveBeenCalledWith(7)
  })
})
