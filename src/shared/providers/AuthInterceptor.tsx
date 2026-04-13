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
