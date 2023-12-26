import { AuthModal } from '@/components/modals/AuthModal'
import RestrictRoute from '@/Context/RestrictRoute'

function AuthModalLogin() {
  return (
    <RestrictRoute>
      <AuthModal />
    </RestrictRoute>
  )
}

export default AuthModalLogin
