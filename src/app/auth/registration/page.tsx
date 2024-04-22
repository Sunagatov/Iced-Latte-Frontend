import RestrictRoute from '@/Context/RestrictRoute'
import AuthModalRegistr from '@/components/Auth/Modal/AuthModalRegister/AuthModalRegistration'

const RegisterParallelRoute = () => {
  return (
    <RestrictRoute parallel={null}>
      <AuthModalRegistr />
    </RestrictRoute>
  )
}

export default RegisterParallelRoute
