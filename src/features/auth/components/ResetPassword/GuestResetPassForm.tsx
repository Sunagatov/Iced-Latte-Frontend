'use client'

import Loader from '@/shared/components/Loader/Loader'
import Button from '@/shared/components/Buttons/Button/Button'
import FormInput from '@/shared/components/FormInput/FormInput'
import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { changePassSchema } from '@/features/auth/validation'
import { yupResolver } from '@hookform/resolvers/yup'
import { useErrorHandler } from '@/shared/utils/apiError'
import { apiGuestResetPassword } from '@/features/user/api'
import { useForm } from 'react-hook-form'
import { GuestResetPasswordCredentials } from '@/features/auth/types'
import {
  RiLockPasswordLine,
  RiCheckboxCircleLine,
  RiArrowLeftLine,
} from 'react-icons/ri'
import { getPasswordStrength } from '@/features/auth/passwordStrength'
import PasswordStrengthBar from './PasswordStrengthBar'

interface IChangeValues {
  code: string
  password: string
  confirmPassword: string
}

export default function GuestResetPassForm() {
  const [loading, setLoading] = useState(false)
  const [newPw, setNewPw] = useState('')
  const [resetSuccessful, setResetSuccessful] = useState(false)
  const { errorMessage, handleError } = useErrorHandler()

  const {
    handleSubmit,
    register,
    setValue,
    formState: { errors },
  } = useForm<IChangeValues>({
    resolver: yupResolver(changePassSchema),
    defaultValues: { code: '', password: '', confirmPassword: '' },
    mode: 'onChange',
  })
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    const token = searchParams.get('token')

    if (token) setValue('code', token)
  }, [searchParams, setValue])

  const onSubmit = async (values: IChangeValues) => {
    const { code, password } = values
    const data: GuestResetPasswordCredentials = { code, password }

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

  const handleReturnHome = () => {
    router.push('/signin')
  }

  const strength = getPasswordStrength(newPw)

  return (
    <div className="bg-secondary flex min-h-[calc(100vh-80px)] items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {resetSuccessful ? (
          <div className="bg-primary rounded-2xl p-8 text-center shadow-sm ring-1 ring-black/5">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-50">
              <RiCheckboxCircleLine className="text-positive h-8 w-8" />
            </div>
            <h2 className="text-primary mb-2 text-2xl font-bold">
              Password updated!
            </h2>
            <p className="text-secondary mb-6 text-sm">
              Your password has been changed successfully. You can now sign in
              with your new password.
            </p>
            <Button
              id="return-btn"
              onClick={handleReturnHome}
              className="w-full justify-center"
            >
              Sign in
            </Button>
          </div>
        ) : (
          <div className="bg-primary overflow-hidden rounded-2xl shadow-sm ring-1 ring-black/5">
            {/* Header */}
            <div className="from-brand to-brand-solid-hover bg-gradient-to-r px-6 py-8 text-center">
              <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-white/20">
                <RiLockPasswordLine className="h-7 w-7 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-white">
                Reset your password
              </h2>
              <p className="mt-1 text-sm text-white/70">
                Enter the code from your email and choose a new password
              </p>
            </div>

            {/* Form */}
            <div className="p-6">
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                {errorMessage && (
                  <div className="text-negative rounded-lg bg-red-50 px-4 py-3 text-sm">
                    {errorMessage}
                  </div>
                )}

                {!searchParams.get('token') && (
                  <FormInput
                    id="code"
                    register={register}
                    name="code"
                    label="Code from email"
                    type="text"
                    placeholder="Enter the code you received"
                    error={errors.code}
                  />
                )}

                <div>
                  <FormInput
                    id="password"
                    register={register}
                    name="password"
                    label="New password"
                    type="password"
                    placeholder="Minimum 8 characters, one letter, one digit"
                    error={errors.password}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setNewPw(e.target.value)
                    }
                  />
                  {newPw && <PasswordStrengthBar {...strength} />}
                </div>

                <FormInput
                  id="confirmPassword"
                  register={register}
                  name="confirmPassword"
                  label="Confirm new password"
                  type="password"
                  placeholder="Repeat your new password"
                  error={errors.confirmPassword}
                />

                <Button
                  id="reset-btn"
                  type="submit"
                  className="hover:bg-brand-solid-hover mt-2 w-full justify-center"
                >
                  {loading ? <Loader /> : 'Reset password'}
                </Button>
              </form>

              <button
                onClick={() => router.back()}
                className="text-secondary hover:text-primary mt-4 flex w-full items-center justify-center gap-1.5 text-sm transition-colors"
              >
                <RiArrowLeftLine className="h-4 w-4" />
                Go back
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
