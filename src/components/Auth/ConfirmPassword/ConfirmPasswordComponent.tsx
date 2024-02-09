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
import { setCookie } from '@/utils/cookieUtils'
import { useErrorHandler } from '@/services/apiError/apiError'

const ConfirmPasswordComponent = () => {
  const [loading, setLoading] = useState(false)
  const { authenticate, setRefreshToken } = useAuthStore()
  const { errorMessage, handleError } = useErrorHandler()
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
      await setCookie('token', data.token?.token, { path: '/' })

      reset()

      redirectToPreviousRoute()
    } catch (error) {
      handleError(error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <h1 className='text-[36px] text-primary font-medium mb-[16px]'>Confirm password</h1>
      <p className='text-[18px] text-primary font-medium mb-[40px]'>Enter code that was sent to your email to confirm registration.</p>
      <form onSubmit={handleSubmit(onSubmit)} >
        {errorMessage && (
          <div className="mt-4 text-negative">
            {errorMessage}
          </div>
        )}
        <div className="flex-grow md:w-full">
          <FormInput
            id="confirmPassword"
            register={register}
            label="Enter code that was sent to your email"
            name="confirmPassword"
            type="text"
            placeholder="Confirm password ###-###-###"
            error={errors.confirmPassword}
            className="w-full"
          />
        </div>
        <Button type="submit"
          className="mt-6 flex items-center justify-center hover:bg-brand-solid-hover w-[220px]"
        >
          {loading ? <Loader /> : 'Confirm Registration'}</Button>
      </form >
    </>
  )
}

export default ConfirmPasswordComponent