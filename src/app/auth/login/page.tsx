import { AuthModal } from '@/components/Auth/Modal/AuthModalLogin/AuthModal'
import RestrictRoute from '@/Context/RestrictRoute'

function AuthModalLogin() {
  return (
    <RestrictRoute>
      <AuthModal />
    </RestrictRoute>
  )
}

export default AuthModalLogin
