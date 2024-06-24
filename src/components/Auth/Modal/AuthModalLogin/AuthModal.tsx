'use client'
import React, { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import { useEscapeKey } from '@/hooks/useEscapeKey'
import LoginForm from '../../Forms/LoginForm/LoginForm'
import RegistrationForm from '../../Forms/RegistrationForm/RegistrationForm'
import Link from 'next/link'
import useAuthRedirect from '@/hooks/useAuthRedirect'
import GoogleAuthButton from '@/components/UI/Buttons/GoogleButton'

enum SwitchType {
  Login = 'LOGIN',
  Registration = 'REGISTRATION',
}

function AuthModal() {
  const [switchForm, setSwitchForm] = useState<SwitchType>(SwitchType.Login)
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

  const handleClickSwitchFrom = () => {
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
    <div
      className={
        'sm:top-22 fixed bottom-0 right-0 top-20 z-30 flex w-full grow-0 bg-gray-500 bg-opacity-75 min-[440px]:grow'
      }
    >
      <button
        className={'grow-0 bg-gray-500 bg-opacity-75 min-[440px]:grow'}
        onClick={handleCloseModal}
        onKeyDown={() => {}}
        tabIndex={0}
      ></button>
      <div className="flex h-full w-full  flex-col overflow-y-scroll bg-white py-6 shadow-xl min-[440px]:w-[500px]">
        <div className="mr-6 flex items-center justify-center px-4 sm:px-6">
          <h2 className="text-2xl">Sign in for Iced Latte</h2>
        </div>
        <div className="relative flex-1 px-4 sm:px-6">
          {switchForm === SwitchType.Login ? (
            <LoginForm />
          ) : (
            <Link
              href={'/auth/login'}
              onClick={handleClickSwitchFrom}
              className="mt-[10px] flex w-full text-[gray] hover:text-focus"
            >
              Already have account?{' '}
              <span className="ml-[5px] text-primary underline">Sign In</span>
            </Link>
          )}

          <div className=" my-6 flex items-center justify-center">
            <div className=" h-[1px] w-full flex-grow bg-brand-second" />
            <span className="mx-4 text-disabled">or</span>
            <div className=" h-[1px] w-full flex-grow bg-brand-second" />
          </div>
          <div className="flex justify-center">
            <GoogleAuthButton />
          </div>
          <div className="mb-6 mt-4 text-xs text-tertiary">
            By signing in to this app, you agree to our{' '}
            <a href="/terms" className="font-bold text-brand underline">
              Terms of Service
            </a>{' '}
            and{' '}
            <a href="/privacy" className="font-bold text-brand underline">
              Privacy Policy
            </a>
            .
          </div>
          {switchForm === SwitchType.Registration ? (
            <RegistrationForm />
          ) : (
            <div className="flex justify-center font-bold text-tertiary">
              <p className=" ">No account? </p>
              <Link
                href={'/auth/registration'}
                id="register-btn"
                onClick={handleClickSwitchFrom}
                className="ml-1 font-bold text-brand"
              >
                Create one
              </Link>
            </div>
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

export default AuthModal
