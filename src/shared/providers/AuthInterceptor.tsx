'use client'

import { useEffect, type ReactNode } from 'react'
import type { AxiosError, InternalAxiosRequestConfig } from 'axios'
import { useAuthStore, type AuthStore } from '@/features/auth/store'
import { getUserData } from '@/features/user/api'
import { api } from '@/shared/api/client'
import { clearClientSession } from '@/features/session/clearClientSession'
import { useRouter } from 'next/navigation'

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
let refreshPromise: Promise<void> | null = null

const AuthInterceptor = ({ children }: Readonly<AuthInterceptorProps>) => {
  const setAuthenticated = useAuthStore(
    (state: AuthStore): AuthStore['setAuthenticated'] => state.setAuthenticated,
  )
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
          // Never refresh for auth-related endpoints
          !originalRequest.url?.includes('/auth/authenticate') &&
          !originalRequest.url?.includes('/auth/refresh') &&
          !originalRequest.url?.includes('/auth/logout') &&
          !originalRequest.url?.includes('/users') &&
          // Skip refresh when we know the visitor is anonymous
          authStatus !== 'anonymous'

        if (shouldRetry) {
          try {
            originalRequest.isRetry = true

            // Reuse an in-flight refresh instead of starting a new one
            if (!refreshPromise) {
              refreshPromise = apiClient
                .post('/auth/refresh', null)
                .then(async () => {
                  const userData = await getUserData()

                  setAuthenticated(userData)
                })
                .finally(() => {
                  refreshPromise = null
                })
            }

            await refreshPromise

            return apiClient.request(originalRequest)
          } catch (refreshError: unknown) {
            refreshPromise = null
            await clearClientSession()
            router.push('/signin')
            throw refreshError
          }
        }

        throw error
      },
    )

    return () => {
      apiClient.interceptors.response.eject(responseInterceptor)
    }
  }, [router, setAuthenticated])

  return <>{children}</>
}

export default AuthInterceptor
