'use client'

import { useState } from 'react'
import type { SubmitHandler } from 'react-hook-form'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import { loginSchema } from '@/features/auth/validation'
import { RiEyeLine, RiEyeOffLine } from 'react-icons/ri'
import { apiLoginUser } from '@/features/auth/api'
import { authTurnstileEnabled } from '@/features/auth/config'
import { useCompleteAuthSession } from '@/features/auth/hooks/useCompleteAuthSession'
import { useTurnstileVerification } from '@/features/auth/hooks/useTurnstileVerification'
import { trackGoogleAnalyticsEvent } from '@/shared/analytics/googleAnalytics'
import { useFormErrorHandler } from '@/shared/utils/apiError'
import Button from '@/shared/ui/Button'
import FormInput from '@/shared/ui/FormInput'
import Loader from '@/shared/ui/Loader'
import TurnstileWidget from '@/shared/ui/TurnstileWidget'

interface IFormValues {
  email: string
  password: string
}

export default function LoginForm() {
  const [loading, setLoading] = useState(false)
  const turnstile = useTurnstileVerification(
    'Please complete verification before signing in.',
    authTurnstileEnabled,
  )
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
    if (!turnstile.requireVerified()) return

    try {
      setLoading(true)
      await apiLoginUser({ ...formData, turnstileToken: turnstile.token })

      await completeAuthSession()
      trackGoogleAnalyticsEvent('login', { method: 'password' })
      reset()
    } catch (error) {
      handleError(error)
      turnstile.resetChallenge()
    } finally {
      setLoading(false)
    }
  }

  const [showPassword, setShowPassword] = useState(false)

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col">
      {(errorMessage || turnstile.error) && (
        <div className="text-negative mt-4">
          {errorMessage || turnstile.error}
        </div>
      )}
      <FormInput
        id="email"
        register={register}
        name="email"
        type="text"
        autoComplete="email"
        label="Enter your email address"
        placeholder="Enter your email address"
        error={errors.email}
      />
      <FormInput
        id="password"
        register={register}
        type={showPassword ? 'text' : 'password'}
        name="password"
        autoComplete="current-password"
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
      {turnstile.shouldRender && (
        <TurnstileWidget
          action="login"
          ref={turnstile.ref}
          onVerify={turnstile.handleVerify}
        />
      )}
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
