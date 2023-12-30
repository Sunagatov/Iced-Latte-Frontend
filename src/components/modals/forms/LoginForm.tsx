'use client'
import useAuthRedirect from '@/hooks/useAuthRedirect'
import Button from '@/components/ui/Button'
import FormInput from '@/components/ui/FormInput'
import Loader from '@/components/ui/Loader'
import { yupResolver } from '@hookform/resolvers/yup'
import { SubmitHandler, useForm } from 'react-hook-form'
import { ServerError, apiLoginUser } from '@/services/authService'
import { useAuthStore } from '@/store/authStore'
import { useState } from 'react'
import { loginSchema } from '@/validation/loginSchema'

interface IFormValues {
  email: string
  password: string
}

export default function LoginForm() {
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
    resolver: yupResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  })

  const onSubmit: SubmitHandler<IFormValues> = async (formData) => {
    try {
      setLoading(true)
      const data = await apiLoginUser(formData)

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
        setError('root.serverError', {
          type: '400',
          message: 'Wrong email or password',
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
      {errors?.root?.serverError.type === '400' && (
        <div className="mt-4 text-negative">
          {errors?.root?.serverError.message}
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
