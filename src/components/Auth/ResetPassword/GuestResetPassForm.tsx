'use client'

import Loader from '@/components/UI/Loader/Loader'
import Button from '@/components/UI/Buttons/Button/Button'
import FormInput from '@/components/UI/FormInput/FormInput'
import { useState } from 'react'
import { FieldValues, SubmitHandler, useForm } from 'react-hook-form'
import { useRouter } from 'next/navigation'
import { changePassSchema } from '@/validation/passwordSchema'
import { yupResolver } from '@hookform/resolvers/yup'
import { IChangeValues } from '@/types/ChangePassword'
import { useErrorHandler } from '@/services/apiError/apiError'
import { apiGuestResetPassword } from '@/services/authService'
import { GuestResetPasswordCredentials } from '@/types/services/AuthServices'

export default function GuestResetPassForm() {
  const [loading, setLoading] = useState(false)
  const { errorMessage, handleError } = useErrorHandler()
  const {
    handleSubmit,
    register,
    formState: { errors },
  } = useForm<IChangeValues>({
    resolver: yupResolver(changePassSchema),
    defaultValues: {
      confirmPassword: ''
    },
  })
  const [resetSuccessful, setResetSuccessful] = useState(false)
  const router = useRouter()

  const handleButtonClick = () => {
    router.push('/')
  }

  const onSubmit: SubmitHandler<FieldValues> = async (values) => {
    const storedEmail = localStorage.getItem('emailForReset') || ''
    const { code, password } = values
    const data: GuestResetPasswordCredentials = {
      code,
      email: storedEmail,
      password,
    }

    try {
      setLoading(true)
      await apiGuestResetPassword(data)
      setResetSuccessful(true)
    } catch (error) {
      handleError(error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto mt-4 flex max-w-screen-md items-center justify-center px-4">
      {resetSuccessful ? (
        <div>
          <h2 className="mb-4 pt-6 text-4xl font-medium text-slate-950">
            Password has been changed.
          </h2>
          <Button onClick={handleButtonClick}>Return to main page</Button>
        </div>
      ) : (
        <div>
          <h2 className="mb-4 pt-6 text-4xl font-medium text-slate-950">
            Reset your password
          </h2>
          <p className="mb-8 text-lg font-medium text-slate-950">
            Almost done. Your password must contain a minimum of 8 characters,
            one letter, one digit.
          </p>
          <form onSubmit={handleSubmit(onSubmit)}>
            {errorMessage && (
              <div className="mt-4 text-negative">{errorMessage}</div>
            )}
            <FormInput
              id="code"
              register={register}
              name="code"
              label="Code from email"
              type="text"
              placeholder="Enter code from email"
              className="mb-5"
              error={errors.code}
            />
            <FormInput
              id="password"
              register={register}
              name="password"
              label="New password"
              type="password"
              placeholder="Enter your new password"
              className="mb-5"
              error={errors.password}
            />
            <FormInput
              id="confirmPassword"
              register={register}
              name="confirmPassword"
              label="Confirm new password"
              type="password"
              placeholder="Enter your new password again"
              className="mb-5"
              error={errors.confirmPassword}
            />
            <Button type="submit" className="my-6 px-6">
              {loading ? <Loader /> : 'Reset password'}
            </Button>
          </form>
        </div>
      )}
    </div>
  )
}