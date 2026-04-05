'use client'

import { useEffect, type ReactNode } from 'react'
import type { AxiosError, InternalAxiosRequestConfig } from 'axios'
import type { AxiosCacheInstance } from 'axios-cache-interceptor'
import { useLogout } from '@/features/auth/hooks'
import { useAuthStore, type AuthStore } from '@/features/auth/store'
import { getUserData } from '@/features/user/api'
import { api } from '@/shared/api/client'

interface CustomAxiosRequestConfig extends InternalAxiosRequestConfig {
  isRetry?: boolean
  skipAuthRetry?: boolean
}

interface AuthInterceptorProps {
  children: ReactNode
}

const apiClient = api as unknown as AxiosCacheInstance

const AuthInterceptor = ({ children }: Readonly<AuthInterceptorProps>) => {
  const setAuthenticated = useAuthStore(
    (state: AuthStore): AuthStore['setAuthenticated'] => state.setAuthenticated,
  )
  const setAnonymous = useAuthStore(
    (state: AuthStore): AuthStore['setAnonymous'] => state.setAnonymous,
  )
  const { logout } = useLogout()

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

        if (
          error.response?.status === 401 &&
          !originalRequest.isRetry &&
          !originalRequest.skipAuthRetry &&
          !originalRequest.url?.includes('/auth/authenticate') &&
          !originalRequest.url?.includes('/auth/refresh') &&
          !originalRequest.url?.includes('/auth/logout') &&
          !originalRequest.url?.includes('/users')
        ) {
          try {
            originalRequest.isRetry = true

            await apiClient.post('/auth/refresh', null)

            const userData = await getUserData()

            setAuthenticated(userData)

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
