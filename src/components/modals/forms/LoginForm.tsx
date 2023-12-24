'use client'

import Button from '@/components/ui/Button'
import FormInput from '@/components/ui/FormInput'
import * as yup from 'yup'
import { yupResolver } from '@hookform/resolvers/yup'
import { SubmitHandler, useForm } from 'react-hook-form'
import { ServerError, apiLoginUser } from '@/services/authService'
import { useAuthStore } from '@/store/authStore'
import { useRouter } from 'next/navigation'

interface IFormValues {
  email: string
  password: string
}

const schema = yup.object().shape({
  email: yup.string().required('Email is a required field'),
  password: yup.string().required('Password is a required field'),
})

export default function LoginForm() {
  const { authenticate } = useAuthStore()
  const router = useRouter()
  const {
    register,
    reset,
    setError,
    handleSubmit,
    formState: { errors },
  } = useForm<IFormValues>({
    resolver: yupResolver(schema),
    defaultValues: {
      email: '',
      password: '',
    },
  })

  const onSubmit: SubmitHandler<IFormValues> = async (formData) => {
    try {
      const data = await apiLoginUser(formData)

      authenticate(data.token)
      reset()
      router.push('/')
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
    }
  }

  return (
    <>
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
          className="mt-6 w-full hover:bg-brand-solid-hover"
        >
          Login
        </Button>
      </form>
    </>
  )
}
