'use client'

import { Suspense, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuthStore } from '@/features/auth/store'
import { getUserData } from '@/features/user/api'
import { getSafeNext } from '@/shared/utils/navigation'
import { ROUTES } from '@/shared/config/routes'

function getOAuthCodeFromHash() {
  const hash = window.location.hash.startsWith('#')
    ? window.location.hash.slice(1)
    : window.location.hash
  const params = new URLSearchParams(hash)

  return params.get('oauthCode')
}

function GoogleCallbackInner() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const setAuthenticated = useAuthStore((s) => s.setAuthenticated)

  useEffect(() => {
    const error = searchParams.get('error')
    const next = getSafeNext(searchParams.get('next')) ?? ROUTES.home
    const signInUrl = `/signin?error=google_auth_failed${
      next !== ROUTES.home ? `&next=${encodeURIComponent(next)}` : ''
    }`

    if (error) {
      router.replace(signInUrl)

      return
    }

    const oauthCode = getOAuthCodeFromHash()

    if (!oauthCode) {
      router.replace(signInUrl)

      return
    }

    // useSessionBootstrap is suppressed on this page via the pathname check.
    // Exchange the backend's one-time OAuth handoff code for HttpOnly cookies
    // via the same-origin proxy, then fetch the current user from the session.
    fetch(`/api/proxy/auth/oauth/token?code=${encodeURIComponent(oauthCode)}`, {
      method: 'POST',
      credentials: 'same-origin',
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error('Failed to establish session')
        }

        return getUserData()
      })
      .then((userData) => {
        setAuthenticated(userData)
        router.replace(next)
      })
      .catch(() => {
        router.replace(signInUrl)
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
