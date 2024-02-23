'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useRouter } from 'next/navigation'
import Button from '@/components/UI/Buttons/Button/Button'
import FormInput from '@/components/UI/FormInput/FormInput'
import { apiAuthChangePassword, apiAuthInitPasswordChange, apiAuthPasswordChangeConfirm } from '@/services/authService'
import { AuthChangePasswordCredentials } from '@/types/services/AuthServices'

export default function AuthResetPassForm() {
  const { handleSubmit, register, reset, getValues } = useForm()
  const [resetSuccessful, setResetSuccessful] = useState(false)

  const router = useRouter()

  const handleButtonClick = () => {
    router.push('/')
  }

  const onSubmit = async () => {

    const { newPassword, oldPassword } = getValues()

    const data: AuthChangePasswordCredentials = {
      newPassword,
      oldPassword,
    }

    const token = localStorage.getItem('token')

    try {
      //  Initiate password reset
      await apiAuthInitPasswordChange()

      // Change password
      await apiAuthChangePassword(data)
      console.log('change password submitted')

      await apiAuthPasswordChangeConfirm(token)

      console.log('change password confirmed')

      setResetSuccessful(true)
      console.log(data)
      reset()
    } catch (error) {
      console.error('Error resetting password:', error)
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
          <form onSubmit={handleSubmit(onSubmit)}>
            <p className="mb-8 text-lg font-medium text-slate-950">
              Almost done. Your password must contain a minimum of 8 characters,
              one letter, one digit.
            </p>

            <FormInput
              id="password"
              register={register}
              name="newPassword"
              label="New password"
              type="password"
              placeholder="Enter your new password"
              className="mb-5"
            />

            <FormInput
              id="password"
              register={register}
              name="oldPassword"
              label="Old password"
              type="password"
              placeholder="Enter your old password"
              className="mb-5"
            />

            <Button type="submit" className="px-6">
              Change password
            </Button>
          </form>
        </div>
      )}
    </div>
  )
}
