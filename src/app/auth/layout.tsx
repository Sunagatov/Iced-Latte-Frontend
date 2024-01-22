import AuthModalRegistr from '@/components/Auth/Modal/AuthModalRegister/AuthModalRegistration'
import { AuthModalProps } from '@/types/AuthModalRegistrationType'

const RegistrationLayout = ({ children }: AuthModalProps) => {

  return (
    <AuthModalRegistr>{children}</AuthModalRegistr>
  )
}

export default RegistrationLayout
