'use client'
import Button from '@/shared/ui/Button'
import FormInput from '@/shared/ui/FormInput'
import Loader from '@/shared/ui/Loader'
import { yupResolver } from '@hookform/resolvers/yup'
import { SubmitHandler, useForm } from 'react-hook-form'
import { apiLoginUser } from '@/features/auth/api'
import { useState } from 'react'
import { loginSchema } from '@/features/auth/validation'
import { RiEyeLine, RiEyeOffLine } from 'react-icons/ri'
interface IFormValues {
  email: string
  password: string
}
import { useErrorHandler } from '@/shared/utils/apiError'
import { useCompleteAuthSession } from '@/features/auth/hooks/useCompleteAuthSession'

export default function LoginForm() {
  const [loading, setLoading] = useState(false)
  const { completeAuthSession } = useCompleteAuthSession()
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
      const { token, refreshToken } = await apiLoginUser(formData)

      await completeAuthSession(token, refreshToken)
      reset()
    } catch (error) {
      handleError(error)
    } finally {
      setLoading(false)
    }
  }

  const [showPassword, setShowPassword] = useState(false)

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
        type={showPassword ? 'text' : 'password'}
        name="password"
        label="Password"
        placeholder="Password"
        error={errors.password}
        endAdornment={
          <button
            type="button"
            aria-label={showPassword ? 'Hide password' : 'Show password'}
            className="text-secondary hover:text-primary cursor-pointer"
            onClick={() => setShowPassword((prev) => !prev)}
          >
            {showPassword ? (
              <RiEyeOffLine className="h-5 w-5" />
            ) : (
              <RiEyeLine className="h-5 w-5" />
            )}
          </button>
        }
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
