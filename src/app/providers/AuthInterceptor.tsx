'use client'

import type { AxiosError, InternalAxiosRequestConfig } from 'axios'
import { useRouter } from 'next/navigation'
import { useEffect, type ReactNode } from 'react'
import {
  clearClientSession,
  refreshAuthenticatedSession,
} from '@/features/session/public'
import { useAuthStore } from '@/features/auth/public'
import { api } from '@/shared/api/client'
import { ROUTES } from '@/shared/config/routes'

interface CustomAxiosRequestConfig extends InternalAxiosRequestConfig {
  isAuthRetry?: boolean
  isRateLimitRetry?: boolean
  skipAuthRetry?: boolean
  skipRateLimitRetry?: boolean
}

interface AuthInterceptorProps {
  children: ReactNode
}

const apiClient = api

// Single-flight mutex: only one refresh can be in-flight at a time.
// Concurrent 401s await the same promise instead of each triggering a new refresh.
let refreshPromise: ReturnType<typeof refreshAuthenticatedSession> | null = null

export function getRetryAfterDelayMs(retryAfter?: string): number {
  const parsedSeconds = retryAfter ? Number(retryAfter) : Number.NaN
  const parsedDate = retryAfter ? Date.parse(retryAfter) : Number.NaN
  const secondsUntilDate = Number.isFinite(parsedDate)
    ? Math.ceil((parsedDate - Date.now()) / 1000)
    : Number.NaN
  const retryAfterSeconds = Number.isFinite(parsedSeconds)
    ? parsedSeconds
    : secondsUntilDate
  const safeSeconds =
    Number.isFinite(retryAfterSeconds) && retryAfterSeconds > 0
      ? retryAfterSeconds
      : 5

  return Math.min(safeSeconds, 60) * 1000
}

export function isRateLimitRetrySafeRequest(
  method?: string,
  headers?: Record<string, unknown>,
): boolean {
  const normalizedMethod = method?.toUpperCase() ?? 'GET'

  if (['GET', 'HEAD', 'OPTIONS'].includes(normalizedMethod)) {
    return true
  }

  const idempotencyKey =
    headers?.['Idempotency-Key'] ??
    headers?.['idempotency-key']

  return typeof idempotencyKey === 'string' && idempotencyKey.length > 0
}

export function isAuthRefreshExcludedRequest(url?: string): boolean {
  if (!url) return false

  try {
    const pathname = /^[a-z][a-z\d+\-.]*:\/\//i.test(url)
      ? new URL(url).pathname
      : url.split('?')[0].split('#')[0]
    const normalizedPath = pathname
      .replace(/^\/api\/proxy/, '')
      .replace(/^\/api\/v1/, '')

    return normalizedPath.startsWith('/auth/')
  } catch {
    return false
  }
}

function normalizeRequestPath(url?: string): string | null {
  if (!url) return null

  try {
    return /^[a-z][a-z\d+\-.]*:\/\//i.test(url)
      ? new URL(url).pathname
      : url.split('?')[0].split('#')[0]
  } catch {
    return null
  }
}

export function isBootstrapRefreshEligibleRequest(url?: string): boolean {
  const pathname = normalizeRequestPath(url)

  if (!pathname) return false

  const normalizedPath = pathname
    .replace(/^\/api\/proxy/, '')
    .replace(/^\/api\/v1/, '')

  return normalizedPath === '/users' || normalizedPath.startsWith('/users/')
}

const AuthInterceptor = ({ children }: Readonly<AuthInterceptorProps>) => {
  const router = useRouter()

  useEffect(() => {
    const responseInterceptor = apiClient.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        const originalRequest = error.config as
          | CustomAxiosRequestConfig
          | undefined

        if (!originalRequest) {
          throw error
        }

        // 429 Too Many Requests — retry once after Retry-After delay
        if (
          error.response?.status === 429 &&
          !originalRequest.isRateLimitRetry &&
          !originalRequest.skipRateLimitRetry &&
          !isAuthRefreshExcludedRequest(originalRequest.url) &&
          isRateLimitRetrySafeRequest(
            originalRequest.method,
            originalRequest.headers,
          )
        ) {
          originalRequest.isRateLimitRetry = true
          const retryAfter = error.response.headers?.['retry-after']
          const delayMs = getRetryAfterDelayMs(retryAfter)

          await new Promise((resolve) => setTimeout(resolve, delayMs))

          return apiClient.request(originalRequest)
        }

        const authStatus = useAuthStore.getState().status
        const shouldRetry =
          error.response?.status === 401 &&
          !originalRequest.isAuthRetry &&
          !originalRequest.skipAuthRetry &&
          !isAuthRefreshExcludedRequest(originalRequest.url) &&
          (authStatus === 'authenticated' ||
            (authStatus === 'loading' &&
              isBootstrapRefreshEligibleRequest(originalRequest.url)))

        if (shouldRetry) {
          try {
            originalRequest.isAuthRetry = true

            // Reuse an in-flight refresh instead of starting a new one
            if (!refreshPromise) {
              refreshPromise = refreshAuthenticatedSession({
                skipAuthRetry: true,
              }).finally(() => {
                refreshPromise = null
              })
            }

            await refreshPromise

            return apiClient.request(originalRequest)
          } catch (refreshError: unknown) {
            refreshPromise = null
            await clearClientSession()
            router.push(ROUTES.signin)
            throw refreshError
          }
        }

        throw error
      },
    )

    return () => {
      apiClient.interceptors.response.eject(responseInterceptor)
    }
  }, [router])

  return <>{children}</>
}

export default AuthInterceptor
