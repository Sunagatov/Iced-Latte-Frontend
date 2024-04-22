import AuthModal from '@/components/Auth/Modal/AuthModalLogin/AuthModal'
import RestrictRoute from '@/Context/RestrictRoute'

function AuthModalLogin() {
  return (
    <RestrictRoute parallel={null}>
      <AuthModal />
    </RestrictRoute>
  )
}

export default AuthModalLogin
