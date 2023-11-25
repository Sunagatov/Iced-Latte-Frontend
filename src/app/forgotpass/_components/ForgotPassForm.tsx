'use client'

import React from 'react'
import { useForm } from 'react-hook-form'
import Button from '@/components/ui/Button'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

// const useResetPasswordStore = create((set) => ({
//   email: '',
//   emailSent: false,
//   resetSuccessful: false,
//   setEmail: (email) => set({ email }),
//   setEmailSent: (emailSent) => set({ emailSent }),
//   setResetSuccessful: (resetSuccessful) => set({ resetSuccessful }),
// }))

// interface ForgotPassFromProps {
//   email: string
// }

export default function ForgotPassForm() {
  const { handleSubmit } = useForm()
  const [email, setEmail] = useState('')
  const [emailSent, setEmailSent] = useState(false)

  const router = useRouter()

  const handleButtonClick = () => {
    router.push('/')
  }
  // const { email, emailSent, setEmail, setEmailSent } = useResetPasswordStore()

  const onSubmit = () => {
    setEmail({ email })
    setEmailSent(true)
  }

  return (
    <div className="mx-auto mt-4 flex  max-w-screen-md items-center justify-center px-4">
      {emailSent ? (
        <div>
          <h2 className="mb-4 pt-6 text-4xl font-medium text-slate-950">
            Your email is on the way!
          </h2>
          <div>
            <p className="mb-10 text-lg font-medium text-slate-950">
              We sent you password reset instructions. If it doesn`t show up
              soon, check your spam folder. We sent it from the email address
              no-reply@abc.com
            </p>
            <Button onClick={handleButtonClick}>Return to main page</Button>
          </div>
        </div>
      ) : (
        <div>
          <h2 className="mb-4 pt-6 text-4xl font-medium text-slate-950">
            Forgot password?
          </h2>
          <form onSubmit={handleSubmit(onSubmit)}>
            <p className="mb-8 text-lg font-medium text-slate-950">
              All good. Enter your account`s email address and we`ll send you a
              link to reset your password.
            </p>
            <div>
              <label className=" text-sm font-medium text-gray-600">
                Enter your email
              </label>
              <input
                className=" my-4 w-full  rounded-md border bg-gray-100 p-2"
                type="email"
                id="email"
                placeholder="Enter your email address"
              />
            </div>
            <Button>Send reset link</Button>
          </form>
        </div>
      )}
    </div>
  )
}
