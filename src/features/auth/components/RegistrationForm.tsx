'use client'
import Button from '@/shared/ui/Button'
import FormInput from '@/shared/ui/FormInput'
import Loader from '@/shared/ui/Loader'
import { yupResolver } from '@hookform/resolvers/yup'
import { SubmitHandler, useForm } from 'react-hook-form'
import { apiRegisterUser } from '@/features/auth/api'
import { useState } from 'react'
import { registrationSchema } from '@/features/auth/validation'
import { RiEyeLine, RiEyeOffLine } from 'react-icons/ri'
import { useRouter } from 'next/navigation'
interface IFormValues {
  firstName: string
  lastName: string
  email: string
  password: string
}
import { useFormErrorHandler } from '@/shared/utils/apiError'

export default function RegistrationForm() {
  const [loading, setLoading] = useState(false)
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
    try {
      setLoading(true)
      const data = await apiRegisterUser(formData)

      if (data) {
        router.push('/confirm_registration')
      }
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
      <Button
        id="register-btn"
        disabled={false}
        type="submit"
        className="hover:bg-brand-solid-hover mt-6 flex w-full items-center justify-center"
      >
        {loading ? <Loader /> : 'Register'}
      </Button>
    </form>
  )
}
