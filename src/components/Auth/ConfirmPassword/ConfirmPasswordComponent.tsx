'use client'
import FormInput from '@/components/UI/FormInput/FormInput'
import Button from '@/components/UI/Buttons/Button/Button'
import Loader from '@/components/UI/Loader/Loader'
import { useAuthStore } from '@/store/authStore'
import { useState } from 'react'
import { SubmitHandler, useController, useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import { apiConfirmEmail } from '@/services/authService'
import { confirmPasswordSchema } from '@/validation/confirmPasswordSchema'
import { IFormValues } from '@/types/ConfirmPassword'
import { setCookie } from '@/utils/cookieUtils'
import { useErrorHandler } from '@/services/apiError/apiError'
import useAuthRedirect from '@/hooks/useAuthRedirect'

const ConfirmPasswordComponent = () => {
  const [loading, setLoading] = useState(false)
  const { authenticate, setRefreshToken } = useAuthStore()
  const { errorMessage, handleError } = useErrorHandler()

  const {
    register,
    reset,
    handleSubmit,
    formState: { errors },
    control,
  } = useForm<IFormValues>({
    resolver: yupResolver(confirmPasswordSchema),
    defaultValues: {
      confirmPassword: '',
    },
  })

  const { field } = useController({
    name: 'confirmPassword',
    control,
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value

    if (inputValue.length > 11) {
      return
    }

    const formattedInputValue = inputValue
      .replace(/\D/g, '')
      .replace(/(\d{3})(\d{1,3})?(\d{1,3})?/, (_, p1, p2, p3) => {
        let result: string = p1

        if (p2) result += `-${p2}`
        if (p3) result += `-${p3}`

        return result
      })

    field.onChange(formattedInputValue)
  }

  const { handleRedirectForAuth } = useAuthRedirect()

  const onSubmit: SubmitHandler<IFormValues> = async (values) => {
    try {
      setLoading(true)

      const data = await apiConfirmEmail(values.confirmPassword)

      if (data) {
        await setCookie('token', data.token?.token, { path: '/' })
        authenticate(data.token?.token)
        setRefreshToken(data.token?.refreshToken)
        reset()

        handleRedirectForAuth()
      }
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
            value={field.value}
            onChange={handleInputChange}
            id="confirmPassword"
            register={register}
            label="Enter code that was sent to your email"
            name="confirmPassword"
            type="text"
            placeholder="Confirmation code ###-###-###"
            error={errors.confirmPassword}
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
