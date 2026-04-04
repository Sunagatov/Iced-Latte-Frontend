'use client'
import { useRouter, useSearchParams } from 'next/navigation'

export function useAuthRedirect() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const handleRedirectForAuth = () => {
    const next = searchParams.get('next')

    router.push(next ?? '/profile')
  }

  return { handleRedirectForAuth }
}
