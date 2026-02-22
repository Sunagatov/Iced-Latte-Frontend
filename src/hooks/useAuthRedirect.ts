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


  const handleRedirectForAuth = () => {
    router.push(previousRouteForAuth || '/profile')
  }

  return { handleRedirectForAuth }
}

export default useAuthRedirect
