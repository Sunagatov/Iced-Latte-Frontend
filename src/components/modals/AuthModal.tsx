import Button from '@/components/ui/Button'
import { useState } from 'react'
import LoginForm from './forms/LoginForm'
import RegistrationForm from './forms/RegistrationForm'
import Link from 'next/link'

type LoginModalProps = {
  onCloseModal?: () => void
}
enum SwitchType {
  Login = 'LOGIN',
  Registration = 'REGISTRATION',
}

export function AuthModal({ onCloseModal }: LoginModalProps) {
  const [switchForm, setSwitchForm] = useState<SwitchType>(SwitchType.Login)
  const handleClickSwitchFrom = () => {
    setSwitchForm(
      switchForm === SwitchType.Login
        ? SwitchType.Registration
        : SwitchType.Login,
    )
  }

  return (
    <div className={'fixed bottom-0 right-0 top-14 z-30 flex w-full sm:top-24'}>
      <div
        className={'grow-0 bg-gray-500 bg-opacity-75 min-[440px]:grow'}
        onClick={onCloseModal}
      ></div>
      <div className="flex h-full w-full flex-col overflow-y-scroll bg-white py-6 shadow-xl min-[440px]:w-[500px]">
        <div className="px-4 sm:px-6">
          <h2 className="text-4XL">Welcome back</h2>
        </div>
        <div className="relative flex-1 px-4 sm:px-6">
          {switchForm === SwitchType.Login ? (
            <LoginForm />
          ) : (
            <Button
              onClick={handleClickSwitchFrom}
              className="mt-6 w-full hover:bg-brand-solid-hover"
            >
              Login
            </Button>
          )}
          {switchForm === SwitchType.Login && (
            <Link href="/">
              <Button className="mt-6 w-full hover:bg-brand-solid-hover">
                Forgotten your password?
              </Button>
            </Link>
          )}
          <div className="mb-8 mt-6 h-[1px] w-full bg-brand-second" />
          <h2 className="text-4XL">I’m new here</h2>
          {switchForm === SwitchType.Registration ? (
            <RegistrationForm />
          ) : (
            <Button
              onClick={handleClickSwitchFrom}
              className="mt-6 w-full hover:bg-brand-solid-hover"
            >
              Register
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
