'use client'
import axios, { AxiosError, AxiosRequestConfig } from 'axios'
import { RootLayoutProps } from '@/app/layout'
import { useAuthStore } from '@/store/authStore'
import { apiRefreshToken } from '@/services/authService'
import { useRouter } from 'next/navigation'
import { api } from '@/services/apiConfig/apiConfig'

interface CustomAxiosRequestConfig extends AxiosRequestConfig {
  _isRetry?: boolean;
}

const InterceptorsForRefreshToken = ({ children }: RootLayoutProps) => {
  const { refreshToken, authenticate, reset } = useAuthStore()
  const router = useRouter()

  api.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
      const originalRequest = error.config as CustomAxiosRequestConfig

      // If the error is 401 (Unauthorized), let's try to update the token. Remove the check (!originalRequest.url?.includes('/auth/authenticate')) after fixing errors on the server that have a 401 status past the token.
      if (error.response && error.response.status === 401 && error.config && !originalRequest._isRetry &&
        !originalRequest.url?.includes('/auth/authenticate')
      ) {
        originalRequest._isRetry = true

        try {
          const refreshData = await apiRefreshToken(refreshToken)

          // If the update is successful, repeat the original request
          if (refreshData) {
            authenticate(refreshData.refreshToken)
          }

          // Let's repeat the original query
          return axios.request(originalRequest)
        } catch (refreshError) {
          if (refreshError)
            reset()
          router.push('/')
          throw refreshError
        }
      }

      // Return an error if not 401 or failed to update the token
      throw error
    },
  )

  return (
    <>
      {children}
    </>
  )
}

export default InterceptorsForRefreshToken
