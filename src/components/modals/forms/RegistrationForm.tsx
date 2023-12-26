'use client'
import Button from '@/components/ui/Button'
import FormInput from '@/components/ui/FormInput'
import * as yup from 'yup'
import { yupResolver } from '@hookform/resolvers/yup'
import { SubmitHandler, useForm } from 'react-hook-form'
import { ServerError, apiRegisterUser } from '@/services/authService'
import { useAuthStore } from '@/store/authStore'
import { useRouter } from 'next/navigation'

interface IFormValues {
  firstName: string
  lastName: string
  email: string
  password: string
}

const emailRegex =
  /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/g

const nameRegex = /^(?!\\s)(?!.*\\s$)(?!.*?--)[A-Za-z\\s-]*$/


const schema = yup.object().shape({
  firstName: yup
    .string()
    .required('First name is a required field')
    .min(2, 'First name should have a length between 2 and 128 characters')
    .max(128, 'First name should have a length between 2 and 128 characters')
    .matches(
      nameRegex,
      'First name can contain Latin letters, spaces, and hyphens',
    ),
  lastName: yup
    .string()
    .required('Last name is a required field')
    .min(2, 'Last name should have a length between 2 and 128 characters')
    .max(128, 'Last name should have a length between 2 and 128 characters')
    .matches(
      nameRegex,
      'Last name can contain Latin letters, spaces, and hyphens',
    ),
  email: yup
    .string()
    .required('Email is a required field')
    .email('Invalid email')
    .matches(emailRegex, 'Invalid email'),
  password: yup
    .string()
    .required('Password is a required field')
    .min(8, 'Password should have a length between 8 and 128 characters')
    .max(128, 'Password should have a length between 8 and 128 characters')
    .matches(
      /(?=.*\d)(?=.*[a-zA-Z])[0-9a-zA-Z@$!%*?&]{8,}/g,
      'Password should contain at least 1 letter, 1 digit, and may include special characters "@$!%*?&"',
    ),
})

export default function RegistrationForm() {
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
      firstName: '',
      lastName: '',
      email: '',
      password: '',
    },
  })

  const onSubmit: SubmitHandler<IFormValues> = async (formData) => {
    try {
      const data = await apiRegisterUser(formData)

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
        setError('email', {
          type: 'manual',
          message: 'This email already exists',
        })
      }
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
      <Button type="submit" className="mt-6 w-full hover:bg-brand-solid-hover">
        Register
      </Button>
    </form>
  )
}
