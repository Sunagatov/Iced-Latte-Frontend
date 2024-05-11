'use client'

import Loader from '@/components/UI/Loader/Loader'
import Button from '@/components/UI/Buttons/Button/Button'
import FormInput from '@/components/UI/FormInput/FormInput'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { changePassSchema } from '@/validation/changePassSchema'
import { yupResolver } from '@hookform/resolvers/yup'
import { IChangeValues } from '@/types/ChangePassword'
import { useErrorHandler } from '@/services/apiError/apiError'
import { apiGuestResetPassword } from '@/services/userService'
import { FieldValues, SubmitHandler, useForm } from 'react-hook-form'
import { GuestResetPasswordCredentials } from '@/types/services/AuthServices'
import { useLocalSessionStore } from '@/store/useLocalSessionStore'

export default function GuestResetPassForm() {
  const [loading, setLoading] = useState(false)
  const { errorMessage, handleError } = useErrorHandler()
  const setStoredEmailSent = useLocalSessionStore(
    (state) => state.setStoredEmailSent,
  )
  const resetSuccessful = useLocalSessionStore((state) => state.resetSuccessful)
  const setResetSuccessful = useLocalSessionStore(
    (state) => state.setResetSuccessful,
  )

  const {
    handleSubmit,
    register,
    formState: { errors },
  } = useForm<IChangeValues>({
    resolver: yupResolver(changePassSchema),
    defaultValues: {
      code: '',
      password: '',
      confirmPassword: '',
    },
  })
  const router = useRouter()

  const onSubmit: SubmitHandler<FieldValues> = async (values) => {
    const storedEmail = localStorage.getItem('emailForReset') ?? ''
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
      localStorage.removeItem('emailForReset')
    }
  }

  const handleButtonClick = () => {
    router.push('/')
    setResetSuccessful(false)
    setStoredEmailSent(false)
  }

  return (
    <div className="mx-auto mt-4 flex max-w-screen-md items-center justify-center px-4">
      {resetSuccessful ? (
        <div>
          <h2 className="mb-4 pt-6 text-4xl font-medium text-slate-950">
            Password has been changed.
          </h2>
          <Button id="return-btn" onClick={handleButtonClick}>
            Return to main page
          </Button>
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
            <Button
              id="reset-btn"
              type="submit"
              className="mt-6 flex  items-center justify-center hover:bg-brand-solid-hover"
            >
              {loading ? <Loader /> : 'Reset password'}
            </Button>
          </form>
        </div>
      )}
    </div>
  )
}
