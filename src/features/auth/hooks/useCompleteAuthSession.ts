'use client'

import { useAuthStore } from '@/features/auth/store'
import { getUserData } from '@/features/user/api'
import { setAuthCookies } from '@/shared/utils/cookieUtils'
import { useAuthRedirect } from './useAuthRedirect'
import { useCallback } from 'react'

/**
 * Returns a function that completes a successful auth flow:
 * sets cookies, fetches user data, updates auth store, and redirects.
 */
export function useCompleteAuthSession() {
  const { setAuthenticated } = useAuthStore()
  const { handleRedirectForAuth } = useAuthRedirect()

  const completeAuthSession = useCallback(
    async (token: string, refreshToken: string): Promise<void> => {
      await setAuthCookies(token, refreshToken)
      const userData = await getUserData()

      setAuthenticated(userData)
      handleRedirectForAuth()
    },
    [setAuthenticated, handleRedirectForAuth],
  )

  return { completeAuthSession }
}
