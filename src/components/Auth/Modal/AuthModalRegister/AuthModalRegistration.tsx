'use client'
import { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { useEscapeKey } from '@/hooks/useEscapeKey'
import LoginForm from '@/components/Auth/Forms/LoginForm/LoginForm'
import RegistrationForm from '@/components/Auth/Forms/RegistrationForm/RegistrationForm'
import Link from 'next/link'
import Button from '@/components/UI/Buttons/Button/Button'
import useAuthRedirect from '@/hooks/useAuthRedirect'

enum SwitchType {
  Login = 'LOGIN',
  Registration = 'REGISTRATION',
}

function AuthModalRegistr() {
  const [switchForm, setSwitchForm] = useState<SwitchType>(
    SwitchType.Registration,
  )
  const pathname = usePathname()
  const { handleRedirectForAuth } = useAuthRedirect()

  useEffect(() => {
    if (pathname !== '/') {
      document.body.style.overflowY = 'hidden'
    } else {
      document.body.style.overflowY = 'auto'
    }

    return () => {
      document.body.style.overflowY = 'auto'
    }
  }, [pathname])

  const handleClickSwitchForm = () => {
    setSwitchForm(
      switchForm === SwitchType.Login
        ? SwitchType.Registration
        : SwitchType.Login,
    )
  }

  const handleCloseModal = () => {
    handleRedirectForAuth()
  }

  useEscapeKey(() => {
    handleCloseModal()
  })

  return (
    <div className={'sm:top-22 fixed bottom-0 right-0 top-20 z-30 flex w-full'}>
      <button
        className={'grow-0 bg-gray-500 bg-opacity-75 min-[440px]:grow'}
        onClick={handleCloseModal}
        onKeyDown={() => {}}
        tabIndex={0}
      ></button>
      <div className="flex h-full w-full flex-col overflow-y-scroll bg-white py-6 shadow-xl min-[440px]:w-[500px]">
        <div className="px-4 sm:px-6">
          <h2 className="text-4XL">Welcome back</h2>
          {switchForm === SwitchType.Login ? (
            <LoginForm />
          ) : (
            <Link
              href="/auth/login"
              onClick={handleClickSwitchForm}
              className="mt-[10px] flex w-full text-[gray] hover:text-focus"
            >
              Already have account?{' '}
              <span className="ml-[5px] text-primary underline">Sign In</span>
            </Link>
          )}
          {switchForm === SwitchType.Login && (
            <Link
              href="/"
              className="mt-[40px] flex items-center justify-center text-focus"
            >
              Forgot password
            </Link>
          )}
          <div className="mb-8 mt-6 h-[1px] w-full bg-brand-second" />
        </div>
        <div className="relative flex-1 px-4 sm:px-6">
          {switchForm === SwitchType.Registration ? (
            <RegistrationForm />
          ) : (
            <>
              <h2 className="text-4XL">I’m new here</h2>
              <Link href="/auth/registration">
                <Button
                  id="register-btn"
                  type="button"
                  onClick={handleClickSwitchForm}
                  className="mt-6 w-full hover:bg-brand-solid-hover"
                >
                  Register
                </Button>
              </Link>
            </>
          )}
          {switchForm === SwitchType.Registration && (
            <p className="text-text-tertiary mt-4 text-xs font-medium">
              By registering for an account, you agree to our{' '}
              <a
                className="text-text-tertiary text-xs font-medium underline"
                href="/"
              >
                Terms of Use.
              </a>
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
export default AuthModalRegistr
