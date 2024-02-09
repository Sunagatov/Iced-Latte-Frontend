'use client'
import { AxiosError, InternalAxiosRequestConfig, AxiosResponse } from 'axios'
import { SuccessRefreshToken } from '@/types/services/AuthServices'
import { RootLayoutProps } from '@/app/layout'
import { useAuthStore } from '@/store/authStore'
import { useRouter } from 'next/navigation'
import { api } from '@/services/apiConfig/apiConfig'
import { useEffect } from 'react'
import { removeCookie } from '@/utils/cookieUtils'
import { useFavouritesStore } from '@/store/favStore'

interface CustomAxiosRequestConfig extends InternalAxiosRequestConfig {
  isRetry?: boolean;
}

const InterceptorsForRefreshToken = ({ children }: RootLayoutProps) => {
  const { token, refreshToken, authenticate, reset } = useAuthStore()
  const { resetFav } = useFavouritesStore()
  const router = useRouter()

  useEffect(() => {
    const requestInterceptor = api.interceptors.request.use((config) => {
      if (!config.headers['Authorization']) {
        config.headers['Authorization'] = `Bearer ${token}`
      }

      return config
    })

    const responseInterceptor = api.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        const originalRequest = error.config as CustomAxiosRequestConfig

        // If the error is 401 (Unauthorized), let's try to update the token. Remove the check (!originalRequest.url?.includes('/auth/authenticate')) after fixing errors on the server that have a 401 status past the token.
        if (
          error.response?.status === 401 &&
          !originalRequest.isRetry &&
          !originalRequest.url?.includes('/auth/authenticate') && !originalRequest.url?.includes('/auth/refresh')
        ) {
          try {
            originalRequest.isRetry = true

            const response: AxiosResponse<SuccessRefreshToken> =
              await api.post('/auth/refresh', null, { headers: { Authorization: `Bearer ${refreshToken}` } })

            // If the update is successful, repeat the original request
            if (response) {
              authenticate(response.data.refreshToken)
              originalRequest.headers['Authorization'] = `Bearer ${response.data.refreshToken}`
            }

            // Let's repeat the original query
            return api.request(originalRequest)

          } catch (refreshError) {
            if (refreshError)
              reset()
            await removeCookie('token')
            resetFav()
            router.push('/')
            throw refreshError
          }
        }

        // Return an error if not 401 or failed to update the token
        throw error
      },
    )

    // Cleanup the interceptor on component unmount
    return () => {
      api.interceptors.request.eject(requestInterceptor)
      api.interceptors.response.eject(responseInterceptor)
    }
  }, [authenticate, refreshToken, reset, resetFav, router, token])

  return (
    <>
      {children}
    </>
  )
}

export default InterceptorsForRefreshToken
