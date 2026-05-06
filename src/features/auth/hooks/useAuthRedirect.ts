'use client'
import { useRouter, useSearchParams } from 'next/navigation'
import { getSafeNext } from '@/shared/utils/navigation'
import { ROUTES } from '@/shared/config/routes'

export function useAuthRedirect() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const handleRedirectForAuth = () => {
    const next = getSafeNext(searchParams.get('next'))

    router.push(next ?? ROUTES.profile)
  }

  return { handleRedirectForAuth }
}
