import { useCallback, useState } from 'react'
import axios, { AxiosError } from 'axios'
import { ErrorResponse } from '@/shared/types/ErrorResponse'

export const handleAxiosError = (error: unknown): string => {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<ErrorResponse>

    if (axiosError.response) {
      const { status, data } = axiosError.response

      if (status === 401) {
        return data?.detail || data?.message || 'Please sign in to continue.'
      }

      if (status === 403) {
        return (
          data?.detail ||
          data?.message ||
          'You do not have permission to perform this action.'
        )
      }

      return (
        data?.detail ||
        data?.message ||
        data?.error ||
        'An unknown error occurred'
      )
    }

    return 'Network error. Please check your connection.'
  }

  return 'An unknown error occurred'
}

export const useErrorHandler = () => {
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const handleError = useCallback((error: unknown) => {
    setErrorMessage(handleAxiosError(error))
  }, [])

  return { errorMessage, handleError }
}
