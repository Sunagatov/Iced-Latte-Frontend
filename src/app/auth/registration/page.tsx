import RestrictRoute from '@/Context/RestrictRoute'
import AuthModalRegistr from '@/components/Auth/Modal/AuthModalRegister/AuthModalRegistration'

const RegisterParallelRoute = () => {
  return (
    <RestrictRoute>
      < AuthModalRegistr />
    </RestrictRoute>
  )
}

export default RegisterParallelRoute