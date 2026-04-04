'use client'
import FormInput from '@/shared/components/FormInput/FormInput'
import Button from '@/shared/components/Buttons/Button/Button'
import Loader from '@/shared/components/Loader/Loader'
import { useAuthStore } from '@/features/auth/store'
import { useState } from 'react'
import { SubmitHandler, useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import { apiConfirmEmail } from '@/features/auth/api'
import { confirmPasswordSchema } from '@/features/auth/validation'
interface IFormValues { confirmPassword: string }
import { setCookie } from '@/shared/utils/cookieUtils'
import { useErrorHandler } from '@/shared/utils/apiError'
import { useAuthRedirect } from '@/features/auth/hooks'

const ConfirmPasswordComponent = () => {
  const [loading, setLoading] = useState(false)
  const { authenticate, setRefreshToken } = useAuthStore()
  const { errorMessage, handleError } = useErrorHandler()

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

  const { handleRedirectForAuth } = useAuthRedirect()

  const onSubmit: SubmitHandler<IFormValues> = async (values) => {
    try {
      setLoading(true)

      const data = await apiConfirmEmail(values.confirmPassword)

      if (data) {
        await setCookie('token', data.token?.token)
        authenticate(data.token?.token)
        setRefreshToken(data.token?.refreshToken)
        reset()

        handleRedirectForAuth()
      }
    } catch (error) {
      handleError(error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <h1 className="mb-[16px] text-[36px] font-medium text-primary">
        Confirm registration
      </h1>
      <p className="mb-[40px] text-[18px] font-medium text-primary">
        Enter code that was sent to your email to confirm registration.
      </p>
      <form onSubmit={handleSubmit(onSubmit)}>
        {errorMessage && (
          <div className="mt-4 text-negative">{errorMessage}</div>
        )}
        <div className="flex-grow md:w-full">
          <FormInput
            id="confirmPassword"
            register={register}
            label="Enter code that was sent to your email"
            name="confirmPassword"
            type="text"
            placeholder="Confirmation code"
            error={errors.confirmPassword}
            className="w-full"
          />
        </div>
        <Button
          id="confirm-pass-btn"
          type="submit"
          className="mt-6 flex w-[220px] items-center justify-center hover:bg-brand-solid-hover"
        >
          {loading ? <Loader /> : 'Confirm Registration'}
        </Button>
      </form>
    </>
  )
}

export default ConfirmPasswordComponent
