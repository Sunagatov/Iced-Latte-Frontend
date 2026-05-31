'use client'
import FormInput from '@/shared/ui/FormInput'
import Button from '@/shared/ui/Button'
import Loader from '@/shared/ui/Loader'
import { useState } from 'react'
import { SubmitHandler, useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import { verifyEmailCode } from '@/features/auth/api'
import { verifyEmailCodeSchema } from '@/features/auth/validation'
interface IFormValues {
  verificationCode: string
}
import { useErrorHandler } from '@/shared/utils/apiError'
import { useCompleteAuthSession } from '@/features/auth/hooks/useCompleteAuthSession'

const VerifyEmailCodeForm = () => {
  const [loading, setLoading] = useState(false)
  const { completeAuthSession } = useCompleteAuthSession()
  const { errorMessage, handleError } = useErrorHandler()

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

      await completeAuthSession()
      reset()
    } catch (error) {
      handleError(error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <h1 className="text-primary mb-[16px] text-[36px] font-medium">
        Confirm registration
      </h1>
      <p className="text-primary mb-[40px] text-[18px] font-medium">
        Enter the confirmation token from your email to confirm registration.
      </p>
      <form onSubmit={handleSubmit(onSubmit)}>
        {errorMessage && (
          <div className="text-negative mt-4">{errorMessage}</div>
        )}
        <div className="flex-grow md:w-full">
          <FormInput
            id="verificationCode"
            register={register}
            label="Enter confirmation token from your email"
            name="verificationCode"
            type="text"
            placeholder="Confirmation token"
            error={errors.verificationCode}
            className="w-full"
          />
        </div>
        <Button
          id="confirm-pass-btn"
          type="submit"
          disabled={loading}
          className="hover:bg-brand-solid-hover mt-6 flex w-[220px] items-center justify-center"
        >
          {loading ? <Loader /> : 'Confirm Registration'}
        </Button>
      </form>
    </>
  )
}

export default VerifyEmailCodeForm
