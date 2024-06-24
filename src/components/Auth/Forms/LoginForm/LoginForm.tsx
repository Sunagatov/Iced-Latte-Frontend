'use client'
import useAuthRedirect from '@/hooks/useAuthRedirect'
import Button from '@/components/UI/Buttons/Button/Button'
import FormInput from '@/components/UI/FormInput/FormInput'
import Loader from '@/components/UI/Loader/Loader'
import { yupResolver } from '@hookform/resolvers/yup'
import { SubmitHandler, useForm } from 'react-hook-form'
import { apiLoginUser } from '@/services/authService'
import { useAuthStore } from '@/store/authStore'
import { useState } from 'react'
import { loginSchema } from '@/validation/loginSchema'
import { IFormValues } from '@/types/LoginForm'
import { useErrorHandler } from '@/services/apiError/apiError'
import { setCookie } from '@/utils/cookieUtils'
import Link from 'next/link'
import Image from 'next/image'
import eye from '../../../../../public/eye-password-hide.svg'

export default function LoginForm() {
  const [loading, setLoading] = useState(false)
  const { authenticate, setRefreshToken } = useAuthStore()
  const [passwordVisible, setPasswordVisible] = useState(false)
  const { handleRedirectForAuth } = useAuthRedirect()
  const { errorMessage, handleError } = useErrorHandler()
  const {
    register,
    reset,
    handleSubmit,
    formState: { errors },
  } = useForm<IFormValues>({
    resolver: yupResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  })
  const { resetOpenModal } = useAuthStore()

  const onSubmit: SubmitHandler<IFormValues> = async (formData) => {
    try {
      setLoading(true)
      const data = await apiLoginUser(formData)

      if (data) {
        await setCookie('token', data.token, { path: '/' })
        authenticate(data.token)
        setRefreshToken(data.refreshToken)
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
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="flex flex-col font-bold text-disabled "
    >
      {errorMessage && (
        <div className="mt-4  text-negative">{errorMessage}</div>
      )}
      <FormInput
        id="email"
        register={register}
        name="email"
        type="text"
        label=""
        placeholder="Email"
        error={errors.email}
      />
      <div className="relative font-bold">
        <FormInput
          id="password"
          register={register}
          type={passwordVisible ? 'text' : 'password'}
          name="password"
          label=""
          placeholder="Password"
          error={errors.password}
          className="mt-0"
        />
        <button
          type="button"
          onMouseDown={() => setPasswordVisible(true)}
          onMouseUp={() => setPasswordVisible(false)}
          onMouseLeave={() => setPasswordVisible(false)}
          className="absolute inset-y-0 right-0 mt-5 flex items-center pr-3"
        >
          <div className="h-[18px] w-[18px] sm:h-[31px] sm:w-[28px]">
            <Image src={eye} width={24} alt="Logo" priority />
          </div>
        </button>
      </div>
      <Link
        onClick={resetOpenModal}
        href={'/forgotpass'}
        className="mt-2 flex items-center font-bold text-focus"
      >
        Forgot password?
      </Link>
      <Button
        id="login-btn"
        type="submit"
        className="mt-6 flex w-full items-center justify-center hover:bg-brand-solid-hover"
      >
        {loading ? <Loader /> : 'Login'}
      </Button>
    </form>
  )
}
