'use client'

import { Suspense, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuthStore } from '@/features/auth/store'
import { getUserData } from '@/features/user/api'

function GoogleCallbackInner() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const setAuthenticated = useAuthStore((s) => s.setAuthenticated)

  useEffect(() => {
    const error = searchParams.get('error')
    const next = searchParams.get('next') ?? '/'

    if (error) {
      router.replace('/signin?error=google_auth_failed')

      return
    }

    // useSessionBootstrap is suppressed on this page via the pathname check.
    // Call getUserData directly — the new session cookies are already set
    // by the API route that redirected here.
    getUserData()
      .then((userData) => {
        setAuthenticated(userData)
        router.replace(next)
      })
      .catch(() => {
        router.replace('/signin?error=google_auth_failed')
      })
  }, [searchParams, router, setAuthenticated])

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
