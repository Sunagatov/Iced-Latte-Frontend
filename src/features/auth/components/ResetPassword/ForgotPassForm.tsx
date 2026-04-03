'use client'

import Loader from '@/shared/components/Loader/Loader'
import Button from '@/shared/components/Buttons/Button/Button'
import FormInput from '@/shared/components/FormInput/FormInput'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { yupResolver } from '@hookform/resolvers/yup'
import { apiForgotPassword } from '@/features/user/api'
import { useErrorHandler } from '@/shared/utils/apiError'
import { forgotPassSchema } from '@/features/auth/validation'

interface IForgotValues { email: string }

export default function ForgotPassForm() {
  const [loading, setLoading] = useState(false)
  const [emailSent, setEmailSent] = useState(false)
  const { errorMessage, handleError } = useErrorHandler()
  const router = useRouter()

  const {
    handleSubmit,
    register,
    reset,
    formState: { errors },
  } = useForm<IForgotValues>({
    resolver: yupResolver(forgotPassSchema),
    defaultValues: { email: '' },
  })

  const onSubmit = async (data: IForgotValues): Promise<void> => {
    const { email } = data

    try {
      setLoading(true)
      await apiForgotPassword({ email })
      setEmailSent(true)
      reset()
    } catch (error) {
      handleError(error)
    } finally {
      setLoading(false)
    }
  }

  if (emailSent) {
    return (
      <div className="flex min-h-[calc(100vh-7rem-7rem)] items-center justify-center px-6">
        <div className="w-full max-w-[420px] rounded-2xl border border-[#E2E8F0] bg-white p-10 text-center shadow-sm">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-[#F0EAFF]">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
              <path d="M20 4H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2Z" stroke="#682EFF" strokeWidth="1.8" strokeLinejoin="round"/>
              <path d="m2 6 10 7 10-7" stroke="#682EFF" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-[#0D0D0D]">Check your inbox</h2>
          <p className="mt-3 text-sm text-[#64748B]">
            We sent password reset instructions to your email. If it doesn&apos;t show up, check your spam folder.
          </p>
          <p className="mt-1 text-xs text-[#94A3B8]">Sent from youricedlatteshop@gmail.com</p>
          <Button
            id="reset-continue-btn"
            className="mt-8 flex w-full items-center justify-center hover:bg-brand-solid-hover"
            onClick={() => { router.push('/resetpass') }}
          >
            Continue to reset password
          </Button>
          <Link href="/signin" className="mt-4 block text-sm text-[#682EFF] hover:underline">
            Back to sign in
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-[calc(100vh-7rem-7rem)] items-center justify-center px-6">
      <div className="w-full max-w-[420px]">
        <Link href="/signin" className="mb-8 flex items-center gap-1.5 text-sm text-[#64748B] hover:text-[#0D0D0D]">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path d="M19 12H5M5 12l7 7M5 12l7-7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Back to sign in
        </Link>

        <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-xl bg-[#F0EAFF]">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
            <rect x="3" y="11" width="18" height="11" rx="2" stroke="#682EFF" strokeWidth="1.8"/>
            <path d="M7 11V7a5 5 0 0 1 10 0v4" stroke="#682EFF" strokeWidth="1.8" strokeLinecap="round"/>
          </svg>
        </div>

        <h1 className="mt-4 text-[28px] font-bold text-[#0D0D0D]">Forgot password?</h1>
        <p className="mt-2 text-sm text-[#64748B]">
          No worries — enter your email and we&apos;ll send you reset instructions.
        </p>

        <form className="mt-8" noValidate onSubmit={handleSubmit(onSubmit)}>
          {errorMessage && (
            <div className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">{errorMessage}</div>
          )}
          <FormInput
            id="email"
            register={register}
            name="email"
            label="Email address"
            type="email"
            placeholder="Enter your email address"
            error={errors.email}
          />
          <Button
            id="send-reset-btn"
            type="submit"
            className="mt-6 flex w-full items-center justify-center hover:bg-brand-solid-hover"
          >
            {loading ? <Loader /> : 'Send reset instructions'}
          </Button>
        </form>
      </div>
    </div>
  )
}
