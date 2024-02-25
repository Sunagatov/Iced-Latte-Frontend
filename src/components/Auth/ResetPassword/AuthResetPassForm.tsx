'use client'

import Button from '@/components/UI/Buttons/Button/Button'
import FormInput from '@/components/UI/FormInput/FormInput'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useRouter } from 'next/navigation'
import { useErrorHandler } from '@/services/apiError/apiError'
import { AuthChangePasswordCredentials } from '@/types/services/AuthServices'
import { apiAuthChangePassword, apiAuthInitPasswordChange } from '@/services/authService'
import Loader from '@/components/UI/Loader/Loader'

export default function AuthResetPassForm() {
  const [loading, setLoading] = useState(false)
  const { errorMessage, handleError } = useErrorHandler()
  const { handleSubmit, register, reset, getValues } = useForm()
  const [resetSuccessful, setResetSuccessful] = useState(false)
  const router = useRouter()
  const handleButtonClick = () => {
    router.push('/')
  }


  const onSubmit = async () => {
    const { newPassword, oldPassword } = getValues()
    const data: AuthChangePasswordCredentials = {
      newPassword: newPassword,
      oldPassword: oldPassword,
    }

    try {
      setLoading(true)
      await apiAuthInitPasswordChange()
      await apiAuthChangePassword(data)
      setResetSuccessful(true)
      reset()
    } catch (error) {
      handleError(error)
    }
    finally {
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
              <div className="mt-4 text-negative">
                {errorMessage}
              </div>
            )}
            <FormInput
              id="password"
              register={register}
              name="oldPassword"
              label="Old password"
              type="password"
              placeholder="Enter your old password"
              className="mb-5"
            />
            <FormInput
              id="password"
              register={register}
              name="newPassword"
              label="New password"
              type="password"
              placeholder="Enter your new password"
              className="mb-5"
            />
            <Button type="submit" className="px-6">
              {loading ? <Loader /> : ' Change password'}
            </Button>
          </form>
        </div>
      )}
    </div>
  )
}
