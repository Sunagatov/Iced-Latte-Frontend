import { useCallback, useState } from 'react'
import axios, { AxiosError } from 'axios'
import { ErrorResponse } from '@/shared/types/ErrorResponse'

export const handleAxiosError = (error: unknown): string => {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<ErrorResponse>

    if (axiosError.response) {
      if (axiosError.response.status === 401) return 'Incorrect email or password'
      if (axiosError.response.status === 422) return 'Your review was rejected — it may contain inappropriate content.'

      return axiosError.response.data.message || axiosError.response.data.error || 'An unknown error occurred'
    }
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
