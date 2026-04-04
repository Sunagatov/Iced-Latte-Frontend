'use client'
import { useAuthRedirect } from '@/features/auth/hooks'
import Button from '@/shared/components/Buttons/Button/Button'
import FormInput from '@/shared/components/FormInput/FormInput'
import Loader from '@/shared/components/Loader/Loader'
import { yupResolver } from '@hookform/resolvers/yup'
import { SubmitHandler, useForm } from 'react-hook-form'
import { apiLoginUser, apiGetSession } from '@/features/auth/api'
import { useAuthStore } from '@/features/auth/store'
import { useState } from 'react'
import { loginSchema } from '@/features/auth/validation'
interface IFormValues {
  email: string
  password: string
}
import { useErrorHandler } from '@/shared/utils/apiError'

export default function LoginForm() {
  const [loading, setLoading] = useState(false)
  const { setAuthenticated } = useAuthStore()
  const { handleRedirectForAuth } = useAuthRedirect()
  const { errorMessage, handleError } = useErrorHandler()
  const {
    register,
    reset,
    handleSubmit,
    formState: { errors },
  } = useForm<IFormValues>({
    resolver: yupResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  })

  const onSubmit: SubmitHandler<IFormValues> = async (formData) => {
    try {
      setLoading(true)
      await apiLoginUser(formData)
      const session = await apiGetSession()

      if (!session.authenticated) throw new Error('Login failed')
      setAuthenticated(session.user ?? null)
      reset()
      handleRedirectForAuth()
    } catch (error) {
      handleError(error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col">
      {errorMessage && <div className="text-negative mt-4">{errorMessage}</div>}
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
        id="login-btn"
        type="submit"
        className="hover:bg-brand-solid-hover mt-6 flex w-full items-center justify-center"
      >
        {loading ? <Loader /> : 'Login'}
      </Button>
    </form>
  )
}
