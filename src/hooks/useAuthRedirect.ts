'use client'
import { useRouter } from 'next/navigation'
import { useLocalSessionStore } from '@/store/useLocalSessionStore'
import { useAuthStore } from '@/store/authStore'

interface RegistrationRedirectHook {
  handleRedirectForAuth: () => void
}

const useAuthRedirect = (): RegistrationRedirectHook => {
  const router = useRouter()
  const { previousRouteForAuth } = useLocalSessionStore()
  const { resetOpenModal } = useAuthStore()

  const handleRedirectForAuth = () => {
    if (previousRouteForAuth) {
      router.push(previousRouteForAuth)
      resetOpenModal()
    } else {
      router.push('/')
    }
  }

  return { handleRedirectForAuth }
}

export default useAuthRedirect
