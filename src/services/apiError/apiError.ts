import { useState } from 'react'
import axios, { AxiosError } from 'axios'
import { ErrorResponse } from '@/types/ErrorResponse'

// Function for error handling Axios
export const handleAxiosError = (error: unknown): string => {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<ErrorResponse>

    if (axiosError.response) {
      return `Server Error: ${axiosError.response.data.message || axiosError.response.data.error}`
    }
  }

  return 'An unknown error occurred'
}

// Hook for error handling using the function handleAxiosError
export const useErrorHandler = () => {
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const handleError = (error: unknown) => {
    const message = handleAxiosError(error)

    setErrorMessage(message)
  }

  return { errorMessage, handleError }
}
