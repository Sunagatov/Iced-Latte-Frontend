import AuthModalRegistr from '@/components/modals/AuthModalRegistration'
import RestrictRoute from '@/Context/RestrictRoute'

const RegisterParallelRoute = () => {
  return (
    <RestrictRoute>
      <AuthModalRegistr />
    </RestrictRoute>
  )
}

export default RegisterParallelRoute
