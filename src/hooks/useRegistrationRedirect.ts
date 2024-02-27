'use client'
import { useRouter } from 'next/navigation'
import { useLocalSessionStore } from '@/store/useLocalSessionStore'

interface RegistrationRedirectHook {
  handleRedirect: () => void
}

const useRegistrationRedirect = (): RegistrationRedirectHook => {
  const router = useRouter()
  const { previousRoutes } = useLocalSessionStore()

  const handleRedirect = () => {
    const targetIndex = Math.max(previousRoutes.length - 4, 0)
    const targetRoute = previousRoutes[targetIndex]

    if (targetRoute) {
      router.push(targetRoute)
    } else {
      router.push('/')
    }
  }

  return { handleRedirect }
}

export default useRegistrationRedirect
