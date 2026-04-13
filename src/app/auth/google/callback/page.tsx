'use client'

import { Suspense, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuthStore } from '@/features/auth/store'
import { getUserData } from '@/features/user/api'

function GoogleCallbackInner() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const setAuthenticated = useAuthStore((s) => s.setAuthenticated)
  const setSkipBootstrapRefresh = useAuthStore((s) => s.setSkipBootstrapRefresh)

  useEffect(() => {
    const error = searchParams.get('error')
    const next = searchParams.get('next') ?? '/'

    if (error) {
      router.replace('/signin?error=google_auth_failed')

      return
    }

    // Block useSessionBootstrap from firing a stale refresh with the old token.
    // The new session cookies are already set by the API route that redirected here.
    // Any refresh attempt before getUserData() succeeds would use the old rotated
    // refreshToken, trigger replay detection, and revoke the brand-new session.
    setSkipBootstrapRefresh(true)

    getUserData()
      .then((userData) => {
        setSkipBootstrapRefresh(false)
        setAuthenticated(userData)
        router.replace(next)
      })
      .catch(() => {
        setSkipBootstrapRefresh(false)
        router.replace('/signin?error=google_auth_failed')
      })
  }, [searchParams, router, setAuthenticated, setSkipBootstrapRefresh])

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
