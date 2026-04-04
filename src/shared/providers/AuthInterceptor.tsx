'use client'

import { useEffect, type ReactNode } from 'react'
import type { AxiosError, InternalAxiosRequestConfig } from 'axios'
import type { AxiosCacheInstance } from 'axios-cache-interceptor'
import { useLogout } from '@/features/auth/hooks'
import { apiGetSession } from '@/features/auth/api'
import { useAuthStore, type AuthStore } from '@/features/auth/store'
import type { SessionResponse } from '@/features/auth/types'
import { api } from '@/shared/api/client'

interface CustomAxiosRequestConfig extends InternalAxiosRequestConfig {
  isRetry?: boolean
}

interface AuthInterceptorProps {
  children: ReactNode
}

const apiClient = api as unknown as AxiosCacheInstance
const fetchSession = apiGetSession as unknown as () => Promise<SessionResponse>

const AuthInterceptor = ({ children }: Readonly<AuthInterceptorProps>) => {
  const setAuthenticated = useAuthStore(
    (state: AuthStore): AuthStore['setAuthenticated'] =>
      state.setAuthenticated,
  )
  const setAnonymous = useAuthStore(
    (state: AuthStore): AuthStore['setAnonymous'] => state.setAnonymous,
  )
  const { logout } = useLogout()

  useEffect(() => {
    const responseInterceptor = apiClient.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        const originalRequest = error.config as CustomAxiosRequestConfig | undefined

        if (!originalRequest) {
          throw error
        }

        if (
          error.response?.status === 401 &&
          !originalRequest.isRetry &&
          !originalRequest.url?.includes('/auth/authenticate') &&
          !originalRequest.url?.includes('/auth/refresh')
        ) {
          try {
            originalRequest.isRetry = true

            await apiClient.post('/auth/refresh', null)

            const session = await fetchSession()

            if (!session.authenticated) {
              throw new Error('Session invalid after refresh')
            }

            setAuthenticated(session.user ?? null)

            return apiClient.request(originalRequest)
          } catch (refreshError: unknown) {
            setAnonymous()
            void logout()
            throw refreshError
          }
        }

        throw error
      },
    )

    return () => {
      apiClient.interceptors.response.eject(responseInterceptor)
    }
  }, [logout, setAnonymous, setAuthenticated])

  return <>{children}</>
}

export default AuthInterceptor