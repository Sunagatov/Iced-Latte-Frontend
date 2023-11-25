'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import Button from '@/components/ui/Button'
import { useRouter } from 'next/navigation'

export default function ResetPassForm() {
  const { handleSubmit } = useForm()
  const [resetSuccessful, setResetSuccessful] = useState(false)

  const router = useRouter()
  const handleButtonClick = () => {
    router.push('/')
  }

  const onSubmit = () => {
    setResetSuccessful(true)
  }

  return (
    <div className="mx-auto mt-4 flex max-w-screen-md items-center justify-center px-4">
      {resetSuccessful ? (
        <div>
          <h2 className="mb-4 pt-6 text-4xl font-medium text-slate-950">
            Your password has been changed.
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

            <label className=" text-sm font-medium text-gray-600">
              New password
            </label>
            <input
              className=" my-4 w-full  rounded-md border bg-gray-100 p-2"
              type="password"
              id="password"
              placeholder="Enter your new password"
            />

            <label className=" text-sm font-medium text-gray-600">
              Confirm new password
            </label>
            <input
              className=" my-4 w-full  rounded-md border bg-gray-100 p-2"
              type="password"
              id="password"
              placeholder="Enter your new password"
            />

            <Button>Send reset link</Button>
          </form>
        </div>
      )}
    </div>
  )
}
