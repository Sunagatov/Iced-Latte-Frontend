'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useRouter } from 'next/navigation'
import Button from '@/components/UI/Buttons/Button/Button'
import FormInput from '@/components/UI/FormInput/FormInput'
import axios from 'axios'




export default function ResetPassForm() {
  const { handleSubmit, register } = useForm()
  const [resetSuccessful, setResetSuccessful] = useState(false)

  const router = useRouter()
  const handleButtonClick = () => {
    router.push('/')
  }



  const onSubmit = async () => {
    console.log('reset submitted')

    const data = {
      token: '<KEY>',
      password: '<PASSWORD>',
      confirmPassword: '<PASSWORD>',
    }


    try {

      await axios.post('YOUR_SERVER_API_ENDPOINT', data)
      setResetSuccessful(true)
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
              name="email"
              label="New password"
              type="password"
              placeholder="Enter your new password"
              className="mb-5"
            />

            <FormInput
              id="password"
              register={register}
              name="email"
              label="Confirm new password"
              type="password"
              placeholder="Enter your new password"
              className="mb-5"
            />

            <Button type="submit" className="px-6">
              Reset password
            </Button>
          </form>
        </div>
      )}
    </div>
  )
}
