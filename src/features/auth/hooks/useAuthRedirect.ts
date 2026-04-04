'use client'
import { useLocalSessionStore } from '@/features/user/store'
import { useRouter } from 'next/navigation'

export function useAuthRedirect() {
  const router = useRouter()
  const { previousRouteForAuth } = useLocalSessionStore()

  const handleRedirectForAuth = () => {
    router.push(previousRouteForAuth ?? '/profile')
  }

  return { handleRedirectForAuth }
}
