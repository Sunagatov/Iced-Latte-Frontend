'use client'
import FormInput from '@/components/UI/FormInput/FormInput'
import useAuthRedirect from '@/hooks/useAuthRedirect'
import Button from '@/components/UI/Buttons/Button/Button'
import Loader from '@/components/UI/Loader/Loader'
import { useAuthStore } from '@/store/authStore'
import { useState } from 'react'
import { SubmitHandler, useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import { apiConfirmEmail } from '@/services/authService'
import { confirmPasswordSchema } from '@/validation/confirmPasswordSchema'
import { IFormValues } from '@/types/ConfirmPassword'
import { ErrorResponse } from '@/types/ErrorResponse'
import axios, { AxiosError } from 'axios'

const ConfirmPasswordComponent = () => {
  const [loading, setLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const { authenticate, setRefreshToken } = useAuthStore()
  const { redirectToPreviousRoute } = useAuthRedirect()
  const {
    register,
    reset,
    handleSubmit,
    formState: { errors },
  } = useForm<IFormValues>({
    resolver: yupResolver(confirmPasswordSchema),
    defaultValues: {
      confirmPassword: '',
    },
  })

  const onSubmit: SubmitHandler<IFormValues> = async (values) => {
    try {
      setLoading(true)

      const data = await apiConfirmEmail(values.confirmPassword)

      authenticate(data.token?.token)
      setRefreshToken(data.token?.refreshToken)

      reset()

      redirectToPreviousRoute()
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {

        const axiosError = error as AxiosError<ErrorResponse>

        if (axiosError.response) {
          setErrorMessage(`Server Error: ${axiosError.response.data.message}`)
        }
      } else {
        setErrorMessage('An unknown error occurred')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} >
      {errorMessage && (
        <div className="mt-4 text-negative">
          {errorMessage}
        </div>
      )}
      <div className="flex-grow md:w-[392px]">
        <FormInput
          id="confirmPassword"
          register={register}
          label="confirmPassword"
          name="confirmPassword"
          type="text"
          placeholder="Confirm password"
          error={errors.confirmPassword}
          className="w-full"
        />
      </div>
      <Button type="submit"
        className="mt-6 flex w-full items-center justify-center hover:bg-brand-solid-hover "
      >
        {loading ? <Loader /> : 'Confirm Password'}</Button>
    </form >
  )
}

export default ConfirmPasswordComponent
