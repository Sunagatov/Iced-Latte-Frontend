'use client'
import Button from '@/shared/ui/Button'
import FormInput from '@/shared/ui/FormInput'
import Loader from '@/shared/ui/Loader'
import { yupResolver } from '@hookform/resolvers/yup'
import { SubmitHandler, useForm } from 'react-hook-form'
import { apiLoginUser } from '@/features/auth/api'
import { useRef, useState } from 'react'
import { loginSchema } from '@/features/auth/validation'
import { RiEyeLine, RiEyeOffLine } from 'react-icons/ri'
interface IFormValues {
  email: string
  password: string
}
import { useFormErrorHandler } from '@/shared/utils/apiError'
import { useCompleteAuthSession } from '@/features/auth/hooks/useCompleteAuthSession'
import TurnstileWidget from '@/shared/ui/TurnstileWidget'
import type { TurnstileInstance } from '@marsidev/react-turnstile'
import { FEATURES } from '@/shared/config/features'

export default function LoginForm() {
  const [loading, setLoading] = useState(false)
  const [turnstileToken, setTurnstileToken] = useState('')
  const [turnstileError, setTurnstileError] = useState('')
  const turnstileRef = useRef<TurnstileInstance>(null)
  const { completeAuthSession } = useCompleteAuthSession()
  const {
    register,
    reset,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<IFormValues>({
    resolver: yupResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  })
  const { errorMessage, handleError } = useFormErrorHandler<IFormValues>(setError)

  const onSubmit: SubmitHandler<IFormValues> = async (formData) => {
    if (FEATURES.turnstile && !turnstileToken) {
      setTurnstileError('Please complete verification before signing in.')

      return
    }

    try {
      setLoading(true)
      await apiLoginUser({ ...formData, turnstileToken })

      await completeAuthSession()
      reset()
    } catch (error) {
      handleError(error)
      setTurnstileToken('')
      setTurnstileError('')
      turnstileRef.current?.reset()
    } finally {
      setLoading(false)
    }
  }

  const [showPassword, setShowPassword] = useState(false)

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col">
      {(errorMessage || turnstileError) && (
        <div className="text-negative mt-4">
          {errorMessage || turnstileError}
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
      <TurnstileWidget
        ref={turnstileRef}
        onVerify={(token) => {
          setTurnstileToken(token)
          setTurnstileError('')
        }}
      />
      <Button
        id="login-btn"
        type="submit"
        disabled={loading}
        className="hover:bg-brand-solid-hover mt-6 flex w-full items-center justify-center"
      >
        {loading ? <Loader /> : 'Login'}
      </Button>
    </form>
  )
}
