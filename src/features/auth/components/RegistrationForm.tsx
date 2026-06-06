'use client'

import { useState } from 'react'
import type { SubmitHandler } from 'react-hook-form'
import { useForm } from 'react-hook-form'
import { useRouter } from 'next/navigation'
import { yupResolver } from '@hookform/resolvers/yup'
import { RiEyeLine, RiEyeOffLine } from 'react-icons/ri'
import { apiRegisterUser } from '@/features/auth/api'
import { useCompleteAuthSession } from '@/features/auth/hooks/useCompleteAuthSession'
import { useTurnstileVerification } from '@/features/auth/hooks/useTurnstileVerification'
import { ROUTES } from '@/shared/config/routes'
import { registrationSchema } from '@/features/auth/validation'
import { useFormErrorHandler } from '@/shared/utils/apiError'
import Button from '@/shared/ui/Button'
import FormInput from '@/shared/ui/FormInput'
import Loader from '@/shared/ui/Loader'
import TurnstileWidget from '@/shared/ui/TurnstileWidget'

interface IFormValues {
  firstName: string
  lastName: string
  email: string
  password: string
}

export default function RegistrationForm() {
  const [loading, setLoading] = useState(false)
  const turnstile = useTurnstileVerification(
    'Please complete verification before creating your account.',
  )
  const { completeAuthSession } = useCompleteAuthSession()
  const router = useRouter()

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<IFormValues>({
    resolver: yupResolver(registrationSchema),
    mode: 'onChange',
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
    },
  })

  const [showPassword, setShowPassword] = useState(false)

  const { errorMessage, handleError } = useFormErrorHandler<IFormValues>(setError)

  const onSubmit: SubmitHandler<IFormValues> = async (formData) => {
    if (!turnstile.requireVerified()) return

    try {
      setLoading(true)
      const authenticated = await apiRegisterUser({
        ...formData,
        turnstileToken: turnstile.token,
      })

      if (authenticated) {
        await completeAuthSession()
      } else {
        router.push(ROUTES.confirmRegistration)
      }
    } catch (error) {
      handleError(error)
      turnstile.resetChallenge()
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col">
      {(errorMessage || turnstile.error) && (
        <div className="text-negative mt-4">
          {errorMessage || turnstile.error}
        </div>
      )}
      <FormInput
        id="firstName"
        register={register}
        name="firstName"
        type="text"
        label="First name"
        placeholder="First name"
        error={errors.firstName}
      />
      <FormInput
        id="lastName"
        register={register}
        name="lastName"
        type="text"
        label="Last name"
        placeholder="Last name"
        error={errors.lastName}
      />
      <FormInput
        id="email"
        register={register}
        name="email"
        type="text"
        label="Email address"
        placeholder="Email address"
        error={errors.email}
      />
      <FormInput
        id="password"
        register={register}
        name="password"
        type={showPassword ? 'text' : 'password'}
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
        ref={turnstile.ref}
        onVerify={turnstile.handleVerify}
      />
      <Button
        id="register-btn"
        disabled={loading}
        type="submit"
        className="hover:bg-brand-solid-hover mt-6 flex w-full items-center justify-center"
      >
        {loading ? <Loader /> : 'Register'}
      </Button>
    </form>
  )
}
