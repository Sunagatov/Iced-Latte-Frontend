'use client'
import Button from '@/shared/ui/Button'
import FormInput from '@/shared/ui/FormInput'
import Loader from '@/shared/ui/Loader'
import { yupResolver } from '@hookform/resolvers/yup'
import { SubmitHandler, useForm } from 'react-hook-form'
import { apiRegisterUser } from '@/features/auth/api'
import { useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { registrationSchema } from '@/features/auth/validation'
import { RiEyeLine, RiEyeOffLine } from 'react-icons/ri'
interface IFormValues {
  firstName: string
  lastName: string
  email: string
  password: string
}
import { useFormErrorHandler } from '@/shared/utils/apiError'
import { useCompleteAuthSession } from '@/features/auth/hooks/useCompleteAuthSession'
import TurnstileWidget from '@/features/auth/components/TurnstileWidget'
import type { TurnstileInstance } from '@marsidev/react-turnstile'
import { ROUTES } from '@/shared/config/routes'
import { FEATURES } from '@/shared/config/features'

export default function RegistrationForm() {
  const [loading, setLoading] = useState(false)
  const [turnstileToken, setTurnstileToken] = useState('')
  const [turnstileError, setTurnstileError] = useState('')
  const turnstileRef = useRef<TurnstileInstance>(null)
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
    if (FEATURES.turnstile && !turnstileToken) {
      setTurnstileError('Please complete verification before creating your account.')

      return
    }

    try {
      setLoading(true)
      const authenticated = await apiRegisterUser({ ...formData, turnstileToken })

      if (authenticated) {
        await completeAuthSession()
      } else {
        router.push(ROUTES.confirmRegistration)
      }
    } catch (error) {
      handleError(error)
      setTurnstileToken('')
      setTurnstileError('')
      turnstileRef.current?.reset()
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col">
      {(errorMessage || turnstileError) && (
        <div className="text-negative mt-4">
          {errorMessage || turnstileError}
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
        ref={turnstileRef}
        onVerify={(token) => {
          setTurnstileToken(token)
          setTurnstileError('')
        }}
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
