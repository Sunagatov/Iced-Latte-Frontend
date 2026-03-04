'use client'

import Button from '@/shared/components/Buttons/Button/Button'
import FormInput from '@/shared/components/FormInput/FormInput'
import Loader from '@/shared/components/Loader/Loader'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useRouter } from 'next/navigation'
import { useErrorHandler } from '@/shared/utils/apiError'
import { AuthChangePasswordCredentials } from '@/features/auth/types'
import { apiAuthChangePassword } from '@/features/user/api'
import { yupResolver } from '@hookform/resolvers/yup'
import { authChangePassSchema } from '@/features/auth/validation'
interface IChangeAuthValues { oldPassword: string; newPassword: string }
import { useLocalSessionStore } from '@/features/user/store'
import { RiLockPasswordLine, RiCheckboxCircleLine, RiArrowLeftLine } from 'react-icons/ri'
import { getPasswordStrength } from '@/features/auth/passwordStrength'
import PasswordStrengthBar from './PasswordStrengthBar'

export default function AuthResetPassForm() {
  const [loading, setLoading] = useState(false)
  const [newPw, setNewPw] = useState('')
  const { errorMessage, handleError } = useErrorHandler()
  const { handleSubmit, register, reset, formState: { errors } } = useForm<IChangeAuthValues>({
    resolver: yupResolver(authChangePassSchema),
    defaultValues: { oldPassword: '', newPassword: '' },
    mode: 'onChange',
  })
  const resetSuccessful = useLocalSessionStore((s) => s.resetSuccessful)
  const setResetSuccessful = useLocalSessionStore((s) => s.setResetSuccessful)
  const router = useRouter()

  const onSubmit = async (values: IChangeAuthValues) => {
    const data: AuthChangePasswordCredentials = { newPassword: values.newPassword, oldPassword: values.oldPassword }

    try {
      setLoading(true)
      await apiAuthChangePassword(data)
      setResetSuccessful(true)
      reset()
    } catch (error) {
      handleError(error)
    } finally {
      setLoading(false)
    }
  }

  const strength = getPasswordStrength(newPw)

  return (
    <div className="flex min-h-[calc(100vh-80px)] items-center justify-center bg-secondary px-4 py-12">
      <div className="w-full max-w-md">

        {resetSuccessful ? (
          <div className="rounded-2xl bg-primary p-8 shadow-sm ring-1 ring-black/5 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-50">
              <RiCheckboxCircleLine className="h-8 w-8 text-positive" />
            </div>
            <h2 className="mb-2 text-2xl font-bold text-primary">Password updated!</h2>
            <p className="mb-6 text-sm text-secondary">Your password has been changed successfully. You can now use your new password to sign in.</p>
            <Button id="reset-pass-btn" onClick={() => router.push('/')} className="w-full justify-center">
              Back to home
            </Button>
          </div>
        ) : (
          <div className="rounded-2xl bg-primary shadow-sm ring-1 ring-black/5 overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-brand to-brand-solid-hover px-6 py-8 text-center">
              <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-white/20">
                <RiLockPasswordLine className="h-7 w-7 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-white">Reset your password</h2>
              <p className="mt-1 text-sm text-white/70">Minimum 8 characters, one letter, one digit</p>
            </div>

            {/* Form */}
            <div className="p-6">
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                {errorMessage && (
                  <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-negative">
                    {errorMessage}
                  </div>
                )}

                <FormInput
                  id="password"
                  register={register}
                  name="oldPassword"
                  label="Current password"
                  type="password"
                  placeholder="Enter your current password"
                  error={errors.oldPassword}
                />

                <div>
                  <FormInput
                    id="newPassword"
                    register={register}
                    name="newPassword"
                    label="New password"
                    type="password"
                    placeholder="Enter your new password"
                    error={errors.newPassword}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewPw(e.target.value)}
                  />
                  {newPw && <PasswordStrengthBar {...strength} />}
                </div>

                <Button
                  id="reset-confirm-btn"
                  type="submit"
                  disabled={false}
                  className="mt-2 w-full justify-center hover:bg-brand-solid-hover disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? <Loader /> : 'Change password'}
                </Button>
              </form>

              <button
                onClick={() => router.back()}
                className="mt-4 flex w-full items-center justify-center gap-1.5 text-sm text-secondary hover:text-primary transition-colors"
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
