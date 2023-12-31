'use client'
import FormInput from '@/components/ui/FormInput'
import useAuthRedirect from '@/hooks/useAuthRedirect'
import Button from '@/components/ui/Button'
import Loader from '@/components/ui/Loader'
import { useAuthStore } from '@/store/authStore'
import { useState, useEffect } from 'react'
import { SubmitHandler, useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import { apiConfirmEmail } from '@/services/authService'
import { confirmPasswordSchema } from '@/validation/confirmPasswordSchema'
import { useFormattedTime } from '@/hooks/useCountdownTimer'
import { showError } from '@/utils/showError'

interface IFormValues {
  confirmPassword: string
}

const ConfirmPasswordComponent = () => {
  const [loading, setLoading] = useState(false)
  const [isTimeExpired, setIsTimeExpired] = useState(false)
  const { authenticate, setRegistrationButtonDisabled } = useAuthStore()
  const { redirectToPreviousRoute } = useAuthRedirect()
  const {
    register,
    reset,
    handleSubmit,
    formState: { errors },
  } = useForm<IFormValues>({
    resolver: yupResolver(confirmPasswordSchema),
    defaultValues: {
      confirmPassword: '',
    },
  })

  const durationInMinutes = 4
  const formattedTime = useFormattedTime(durationInMinutes)

  useEffect(() => {
    if (formattedTime === '00:00') {
      setIsTimeExpired(true)
    }
  }, [formattedTime])

  const onSubmit: SubmitHandler<IFormValues> = async (values) => {
    try {
      setLoading(true)

      const data = await apiConfirmEmail(values.confirmPassword)

      if (data.httpStatusCode === 404) {
        setIsTimeExpired(true)
        setLoading(false)
        setRegistrationButtonDisabled(false)
        alert('Unfortunately token will be expired')

        return
      }

      authenticate(data.token?.token)

      reset()

      setRegistrationButtonDisabled(false)

      redirectToPreviousRoute()
    } catch (error) {
      showError(error)
      setRegistrationButtonDisabled(false)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      {isTimeExpired ? (
        <div className="text-red-500">
          Time&apos;s up, sign up again
        </div>
      ) : (
        <div className="text-orange-500">
          remaining time for password confirmation: {formattedTime}
        </div>
      )}
      <div className="flex-grow md:w-[392px]">
        <FormInput
          id="confirmPassword"
          register={register}
          label="confirmPassword"
          name="confirmPassword"
          type="text"
          placeholder="Confirm password"
          error={errors.confirmPassword}
          className="w-full"
        />
      </div>
      <Button type="submit"
        className="mt-6 flex w-full items-center justify-center hover:bg-brand-solid-hover "
      >
        {loading ? <Loader /> : 'Confirm Password'}</Button>
    </form>
  )
}

export default ConfirmPasswordComponent
