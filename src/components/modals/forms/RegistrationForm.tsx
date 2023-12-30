'use client'
import useAuthRedirect from '@/hooks/useAuthRedirect'
import Button from '@/components/ui/Button'
import FormInput from '@/components/ui/FormInput'
import { yupResolver } from '@hookform/resolvers/yup'
import { SubmitHandler, useForm } from 'react-hook-form'
import { ServerError, apiRegisterUser } from '@/services/authService'
import { useAuthStore } from '@/store/authStore'
import { useState } from 'react'
import { registrationSchema } from '@/validation/registrationSchema'
import Loader from '@/components/ui/Loader'

interface IFormValues {
  firstName: string
  lastName: string
  email: string
  password: string
}

export default function RegistrationForm() {
  const [loading, setLoading] = useState(false)
  const { authenticate } = useAuthStore()
  const { redirectToPreviousRoute } = useAuthRedirect()

  const {
    register,
    reset,
    setError,
    handleSubmit,
    formState: { errors },
  } = useForm<IFormValues>({
    resolver: yupResolver(registrationSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
    },
  })

  const onSubmit: SubmitHandler<IFormValues> = async (formData) => {
    try {
      setLoading(true)
      const data = await apiRegisterUser(formData)

      authenticate(data.token)
      reset()
      redirectToPreviousRoute()
    } catch (e) {
      if (e instanceof ServerError) {
        setError('root.serverError', {
          type: '500',
          message: e.message,
        })
      } else {
        setError('email', {
          type: 'manual',
          message: 'This email already exists',
        })
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col">
      {errors?.root?.serverError.type === '500' && (
        <div className="mt-4 text-negative">
          {errors?.root?.serverError.message}
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
        type="password"
        label="Password"
        placeholder="Password"
        error={errors.password}
      />
      <Button
        type="submit"
        className="mt-6 flex w-full items-center justify-center hover:bg-brand-solid-hover "
      >
        {loading ? <Loader /> : 'Register'}
      </Button>
    </form>
  )
}
