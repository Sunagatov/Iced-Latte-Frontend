import { RootLayoutProps } from '../layout'
import AuthModalRegistr from '@/components/Auth/Modal/AuthModalRegister/AuthModalRegistration'

const RegistrationLayout = ({ children }: RootLayoutProps) => {

  return (
    <AuthModalRegistr>{children}</AuthModalRegistr>
  )
}

export default RegistrationLayout
