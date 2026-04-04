'use client'
import { AxiosError, InternalAxiosRequestConfig } from 'axios'
import { useAuthStore } from '@/features/auth/store'
import { api } from '@/shared/api/client'
import { useEffect } from 'react'
import { useLogout } from '@/features/auth/hooks'
import { apiGetSession } from '@/features/auth/api'

interface CustomAxiosRequestConfig extends InternalAxiosRequestConfig {
  isRetry?: boolean
}

const AuthInterceptor = ({ children }: { children: React.ReactNode }) => {
  const { setAuthenticated, setAnonymous } = useAuthStore()
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
            // Refresh via cookie — backend reads the refresh token from HttpOnly cookie
            await api.post('/auth/refresh', null)
            const session = await apiGetSession()

            if (!session.authenticated) throw new Error('Session invalid after refresh')
            setAuthenticated(session.user)

            return api.request(originalRequest)
          } catch {
            setAnonymous()
            await logout()
          }
        }

        throw error
      },
    )

    return () => {
      api.interceptors.response.eject(responseInterceptor)
    }
  }, [setAuthenticated, setAnonymous, logout])

  return <>{children}</>
}

export default AuthInterceptor
