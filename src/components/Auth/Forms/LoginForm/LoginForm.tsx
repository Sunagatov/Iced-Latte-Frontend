'use client'
import useAuthRedirect from '@/hooks/useAuthRedirect'
import Button from '@/components/UI/Buttons/Button/Button'
import FormInput from '@/components/UI/FormInput/FormInput'
import Loader from '@/components/UI/Loader/Loader'
import { yupResolver } from '@hookform/resolvers/yup'
import { SubmitHandler, useForm } from 'react-hook-form'
import { apiLoginUser } from '@/services/authService'
import { useAuthStore } from '@/store/authStore'
import { useState } from 'react'
import { loginSchema } from '@/validation/loginSchema'
import { IFormValues } from '@/types/LoginForm'
import { useErrorHandler } from '@/services/apiError/apiError'
import { setCookie } from '@/utils/cookieUtils'

export default function LoginForm() {
  const [loading, setLoading] = useState(false)
  const { authenticate, setRefreshToken } = useAuthStore()
  const { redirectToPreviousRoute } = useAuthRedirect()
  const {
    register,
    reset,
    handleSubmit,
    formState: { errors },
  } = useForm<IFormValues>({
    resolver: yupResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  })

  const { errorMessage, handleError } = useErrorHandler()

  const onSubmit: SubmitHandler<IFormValues> = async (formData) => {
    try {
      setLoading(true)
      const data = await apiLoginUser(formData)

      await setCookie('token', data.token, { path: '/' })

      authenticate(data.token)
      setRefreshToken(data.refreshToken)
      reset()
      redirectToPreviousRoute()
    } catch (error) {

      handleError(error)

    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col">
      {errorMessage && (
        <div className="mt-4 text-negative">
          {errorMessage}
        </div>
      )}
      <FormInput
        id="email"
        register={register}
        name="email"
        type="text"
        label="Enter your email address"
        placeholder="Enter your email address"
        error={errors.email}
      />
      <FormInput
        id="password"
        register={register}
        type="password"
        name="password"
        label="Password"
        placeholder="Password"
        error={errors.password}
      />
      <Button
        type="submit"
        className="mt-6 flex w-full items-center justify-center hover:bg-brand-solid-hover"
      >
        {loading ? <Loader /> : 'Login'}
      </Button>
    </form>
  )
}
