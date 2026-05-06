import { useCallback, useState } from 'react'
import axios, { AxiosError } from 'axios'
import { toast } from 'react-toastify'
import { ErrorResponse } from '@/shared/types/ErrorResponse'
import { FieldValues, Path, UseFormSetError } from 'react-hook-form'
import { getUserMessage } from '@/shared/utils/errorMessages'

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

export function extractFieldErrors(error: unknown): Array<{ field: string; message: string }> {
  if (axios.isAxiosError(error)) {
    const data = (error as AxiosError<ErrorResponse>).response?.data

    if (data?.errors && data.errors.length > 0) return data.errors
  }

  return []
}

export const useErrorHandler = () => {
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const handleError = useCallback((error: unknown) => {
    setErrorMessage(getUserMessage(error))
  }, [])

  return { errorMessage, handleError }
}

export function useFormErrorHandler<T extends FieldValues>(setError: UseFormSetError<T>) {
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const handleError = useCallback((error: unknown) => {
    const fieldErrors = extractFieldErrors(error)

    fieldErrors.forEach(({ field, message }) => {
      setError(field as Path<T>, { type: 'server', message })
    })
    setErrorMessage(getUserMessage(error))
  }, [setError])

  return { errorMessage, handleError }
}

export function toastError(error: unknown): void {
  toast.error(getUserMessage(error))
}

export const useToastErrorHandler = () => {
  const handleError = useCallback((error: unknown) => {
    toast.error(getUserMessage(error))
  }, [])

  return { handleError }
}
