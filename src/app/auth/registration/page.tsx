import RestrictRoute from '@/Context/RestrictRoute'
import AuthModalRegistr from '@/components/Auth/Modal/AuthModalRegister/AuthModalRegistration'
import ConfirmPasswordPage from './confirm_password/page'

const RegisterParallelRoute = () => {
  return (
    <RestrictRoute>
      < AuthModalRegistr><ConfirmPasswordPage /></AuthModalRegistr>
    </RestrictRoute>
  )
}

export default RegisterParallelRoute
