'use client'
import { AxiosError, InternalAxiosRequestConfig, AxiosResponse } from 'axios'
import { SuccessRefreshToken } from '@/features/auth/types'
import { useAuthStore } from '@/features/auth/store'
import { api } from '@/shared/api/client'
import { useEffect } from 'react'
import { useLogout } from '@/features/auth/hooks'
import { setCookie } from '@/shared/utils/cookieUtils'

interface CustomAxiosRequestConfig extends InternalAxiosRequestConfig {
  isRetry?: boolean
}

const AuthInterceptor = ({ children }: { children: React.ReactNode }) => {
  const { token, refreshToken, authenticate, setRefreshToken } = useAuthStore()
  const { logout } = useLogout()

  useEffect(() => {
    const responseInterceptor = api.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        const originalRequest = error.config as CustomAxiosRequestConfig

        if (
          error.response?.status === 401 &&
          !originalRequest.isRetry &&
          !originalRequest.url?.includes('/auth/authenticate') &&
          !originalRequest.url?.includes('/auth/refresh')
        ) {
          try {
            originalRequest.isRetry = true
            const response: AxiosResponse<SuccessRefreshToken> = await api.post(
              '/auth/refresh',
              null,
              { headers: { Authorization: `Bearer ${refreshToken}` } },
            )

            const { token: newToken, refreshToken: newRefreshToken } = response.data

            // Sync all auth state atomically after refresh
            authenticate(newToken)
            setRefreshToken(newRefreshToken)
            await setCookie('token', newToken, { path: '/' })
            originalRequest.headers['Authorization'] = `Bearer ${newToken}`

            return api.request(originalRequest)
          } catch (refreshError) {
            if (refreshError) await logout()
            throw refreshError
          }
        }

        throw error
      },
    )

    return () => {
      api.interceptors.response.eject(responseInterceptor)
    }
  }, [authenticate, setRefreshToken, refreshToken, token, logout])

  return <>{children}</>
}

export default AuthInterceptor
