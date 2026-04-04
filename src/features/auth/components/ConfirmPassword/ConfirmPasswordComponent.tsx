'use client'
import FormInput from '@/shared/components/FormInput/FormInput'
import Button from '@/shared/components/Buttons/Button/Button'
import Loader from '@/shared/components/Loader/Loader'
import { useAuthStore } from '@/features/auth/store'
import { useState } from 'react'
import { SubmitHandler, useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import { verifyEmailCode, apiGetSession } from '@/features/auth/api'
import { verifyEmailCodeSchema } from '@/features/auth/validation'
interface IFormValues { verificationCode: string }
import { useErrorHandler } from '@/shared/utils/apiError'
import { useAuthRedirect } from '@/features/auth/hooks'

const ConfirmPasswordComponent = () => {
  const [loading, setLoading] = useState(false)
  const { setAuthenticated } = useAuthStore()
  const { errorMessage, handleError } = useErrorHandler()
  const { handleRedirectForAuth } = useAuthRedirect()

  const {
    register,
    reset,
    handleSubmit,
    formState: { errors },
  } = useForm<IFormValues>({
    resolver: yupResolver(verifyEmailCodeSchema),
    defaultValues: { verificationCode: '' },
  })

  const onSubmit: SubmitHandler<IFormValues> = async (values) => {
    try {
      setLoading(true)
      await verifyEmailCode(values.verificationCode)
      const session = await apiGetSession()

      if (!session.authenticated) throw new Error('Verification failed')
      setAuthenticated(session.user)
      reset()
      handleRedirectForAuth()
    } catch (error) {
      handleError(error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <h1 className="mb-[16px] text-[36px] font-medium text-primary">
        Confirm registration
      </h1>
      <p className="mb-[40px] text-[18px] font-medium text-primary">
        Enter code that was sent to your email to confirm registration.
      </p>
      <form onSubmit={handleSubmit(onSubmit)}>
        {errorMessage && (
          <div className="mt-4 text-negative">{errorMessage}</div>
        )}
        <div className="flex-grow md:w-full">
          <FormInput
            id="verificationCode"
            register={register}
            label="Enter code that was sent to your email"
            name="verificationCode"
            type="text"
            placeholder="Confirmation code"
            error={errors.verificationCode}
            className="w-full"
          />
        </div>
        <Button
          id="confirm-pass-btn"
          type="submit"
          className="mt-6 flex w-[220px] items-center justify-center hover:bg-brand-solid-hover"
        >
          {loading ? <Loader /> : 'Confirm Registration'}
        </Button>
      </form>
    </>
  )
}

export default ConfirmPasswordComponent
