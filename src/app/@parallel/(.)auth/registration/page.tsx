import RegisterParallelRoute from '@/app/auth/registration/page'
import { RootLayoutProps } from '@/app/layout'

const RegistrationPageParallel = ({ children }: RootLayoutProps) => {
  return <RegisterParallelRoute>{children}</RegisterParallelRoute>
}

export default RegistrationPageParallel
