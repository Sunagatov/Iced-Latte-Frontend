import { RootLayoutProps } from '../layout'
import AuthModalRegistr from '@/components/modals/AuthModalRegistration'

const RegistrationLayout = ({ children }: RootLayoutProps) => {

  return (
    <AuthModalRegistr>{children}</AuthModalRegistr>
  )
}

export default RegistrationLayout
