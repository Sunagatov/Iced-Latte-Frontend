import { useRouter } from 'next/navigation'
import { apiLogoutUser } from '../api'
import { clearClientSession } from '@/features/session/session'
import { useCallback, useState } from 'react'
import { ROUTES } from '@/shared/config/routes'

export function useLogout() {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const logout = useCallback(async () => {
    try {
      setIsLoading(true)
      await apiLogoutUser()
    } catch {
      // ignore — session is cleared regardless
    } finally {
      await clearClientSession()
      router.push(ROUTES.signin)
      setIsLoading(false)
    }
  }, [router])

  return { logout, isLoading }
}
