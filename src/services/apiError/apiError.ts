import { useCallback, useState } from 'react'
import axios, { AxiosError } from 'axios'
import { ErrorResponse } from '@/types/ErrorResponse'

// Function for error handling Axios
export const handleAxiosError = (error: unknown): string => {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<ErrorResponse>

    if (axiosError.response) {
      if (axiosError.response.status === 401) {
        return 'Incorrect email or password'
      }
      return axiosError.response.data.message || axiosError.response.data.error || 'An unknown error occurred'
    }
  }

  return 'An unknown error occurred'
}

// Hook for error handling using the function handleAxiosError
export const useErrorHandler = () => {
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const handleError = useCallback((error: unknown) => {
    const message = handleAxiosError(error)

    setErrorMessage(message)
  }, [])

  return { errorMessage, handleError }
}
