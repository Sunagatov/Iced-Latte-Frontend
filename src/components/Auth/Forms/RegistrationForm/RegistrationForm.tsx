'use client'
import Button from '@/components/UI/Buttons/Button/Button'
import FormInput from '@/components/UI/FormInput/FormInput'
import Loader from '@/components/UI/Loader/Loader'
import { yupResolver } from '@hookform/resolvers/yup'
import { SubmitHandler, useForm } from 'react-hook-form'
import { apiRegisterUser } from '@/services/authService'
import { useState } from 'react'
import { registrationSchema } from '@/validation/registrationSchema'
import { useRouter } from 'next/navigation'
import { IFormValues } from '@/types/RegistrationForm'

export default function RegistrationForm() {
  const [loading, setLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const router = useRouter()

  const {
    register,
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

      if (data) {
        router.push('/auth/registration/confirm_password')
      }

      const scrollContainer = document.getElementById('scroll-container')

      if (scrollContainer) {
        scrollContainer.scrollIntoView({ behavior: 'smooth' })
      }
    } catch (error) {
      if (error instanceof Error) {
        setErrorMessage(`An error occurred: ${error.message}`)
      } else {
        setErrorMessage(`An unknown error occurred`)
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col">
      {errorMessage && (
        <div className="mt-4 text-negative">
          {errorMessage}
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
        disabled={false}
        type="submit"
        className="mt-6 flex w-full items-center justify-center hover:bg-brand-solid-hover "
      >
        {loading ? <Loader /> : 'Register'}
      </Button>
    </form>
  )
}
