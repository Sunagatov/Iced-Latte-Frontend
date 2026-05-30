'use client'

import { useAuthStore } from '@/features/auth/store'
import { getUserData } from '@/features/user/api'
import { useAuthRedirect } from './useAuthRedirect'
import { useCallback } from 'react'

/**
 * Returns a function that completes a successful auth flow:
 * fetches user data from the cookie-backed session, updates auth store, and redirects.
 */
export function useCompleteAuthSession() {
  const { setAuthenticated } = useAuthStore()
  const { handleRedirectForAuth } = useAuthRedirect()

  const completeAuthSession = useCallback(
    async (): Promise<void> => {
      const userData = await getUserData()

      setAuthenticated(userData)
      handleRedirectForAuth()
    },
    [setAuthenticated, handleRedirectForAuth],
  )

  return { completeAuthSession }
}
