'use client'

import { Suspense, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuthStore } from '@/features/auth/store'
import { useLocalSessionStore } from '@/features/user/store'
import { setCookie } from '@/shared/utils/cookieUtils'

// KNOWN ISSUE: The backend currently delivers tokens via URL query params.
// This means both tokens briefly appear in browser history and can leak into
// logs/analytics before router.replace('/') clears the URL.
// The correct fix is a backend change: backend sets an HttpOnly session cookie
// directly and redirects to a clean URL with no token params.
function GoogleCallbackInner() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { authenticate, setRefreshToken } = useAuthStore()
  const { previousRouteForAuth } = useLocalSessionStore()

  useEffect(() => {
    const run = async () => {
      const token = searchParams.get('token')
      const refreshToken = searchParams.get('refreshToken')
      const error = searchParams.get('error')

      if (error || !token || !refreshToken) {
        router.replace('/signin?error=google_auth_failed')

        return
      }

      authenticate(token)
      setRefreshToken(refreshToken)

      await setCookie('token', token, { path: '/' })

      // Replace URL immediately to remove tokens from browser history
      router.replace(previousRouteForAuth || '/')
    }

    run()
  }, [searchParams, authenticate, setRefreshToken, router, previousRouteForAuth])

  return (
    <div className="flex min-h-screen items-center justify-center">
      <p className="text-sm text-[#64748B]">Signing you in…</p>
    </div>
  )
}

export default function GoogleCallbackPage() {
  return (
    <Suspense>
      <GoogleCallbackInner />
    </Suspense>
  )
}
