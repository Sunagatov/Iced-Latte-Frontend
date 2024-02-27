'use client'
import { useRouter } from 'next/navigation'
import { useLocalSessionStore } from '@/store/useLocalSessionStore'
import { useAuthStore } from '@/store/authStore'

interface RegistrationRedirectHook {
  handleRedirectForLogin: () => void
}

const useLoginRedirect = (): RegistrationRedirectHook => {
  const router = useRouter()
  const { previousRouteForLogin } = useLocalSessionStore()
  const { resetOpenModal } = useAuthStore()

  const handleRedirectForLogin = () => {
    if (previousRouteForLogin) {
      router.push(previousRouteForLogin)
      resetOpenModal()
    } else {
      router.push('/')
    }
  }

  return { handleRedirectForLogin }
}

export default useLoginRedirect
