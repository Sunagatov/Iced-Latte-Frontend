import RestrictRoute from '@/Context/RestrictRoute'
import RegistrationLayout from '../layout'
import { RootLayoutProps } from '@/app/layout'

const RegisterParallelRoute = ({ children }: RootLayoutProps) => {
  return (
    <RestrictRoute>
      <RegistrationLayout >{children}</RegistrationLayout>
    </RestrictRoute>
  )
}

export default RegisterParallelRoute
