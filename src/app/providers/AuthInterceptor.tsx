'use client'

import { useEffect, type ReactNode } from 'react'
import type { AxiosError, InternalAxiosRequestConfig } from 'axios'
import { useAuthStore } from '@/features/auth/store'
import { api } from '@/shared/api/client'
import {
  clearClientSession,
  refreshAuthenticatedSession,
} from '@/features/session/session'
import { useRouter } from 'next/navigation'
import { ROUTES } from '@/shared/config/routes'

interface CustomAxiosRequestConfig extends InternalAxiosRequestConfig {
  isRetry?: boolean
  skipAuthRetry?: boolean
}

interface AuthInterceptorProps {
  children: ReactNode
}

const apiClient = api

// Single-flight mutex: only one refresh can be in-flight at a time.
// Concurrent 401s await the same promise instead of each triggering a new refresh.
let refreshPromise: ReturnType<typeof refreshAuthenticatedSession> | null = null

export function isAuthRefreshExcludedRequest(url?: string): boolean {
  if (!url) return false

  try {
    const pathname = /^[a-z][a-z\d+\-.]*:\/\//i.test(url)
      ? new URL(url).pathname
      : url.split('?')[0].split('#')[0]
    const normalizedPath = pathname
      .replace(/^\/api\/proxy/, '')
      .replace(/^\/api\/v1/, '')

    return (
      normalizedPath === '/auth/authenticate' ||
      normalizedPath === '/auth/refresh' ||
      normalizedPath === '/auth/logout'
    )
  } catch {
    return false
  }
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

        const authStatus = useAuthStore.getState().status
        const shouldRetry =
          error.response?.status === 401 &&
          !originalRequest.isRetry &&
          !originalRequest.skipAuthRetry &&
          !isAuthRefreshExcludedRequest(originalRequest.url) &&
          // Skip refresh when we know the visitor is anonymous
          authStatus !== 'anonymous'

        if (shouldRetry) {
          try {
            originalRequest.isRetry = true

            // Reuse an in-flight refresh instead of starting a new one
            if (!refreshPromise) {
              refreshPromise = refreshAuthenticatedSession().finally(() => {
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
