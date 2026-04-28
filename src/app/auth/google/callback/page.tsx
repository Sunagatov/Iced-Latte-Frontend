'use client'

import { Suspense, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuthStore } from '@/features/auth/store'
import { getUserData } from '@/features/user/api'
import { getSafeNext } from '@/shared/utils/navigation'

function getTokensFromHash() {
  const hash = window.location.hash.startsWith('#')
    ? window.location.hash.slice(1)
    : window.location.hash
  const params = new URLSearchParams(hash)

  return {
    token: params.get('token'),
    refreshToken: params.get('refreshToken'),
  }
}

function GoogleCallbackInner() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const setAuthenticated = useAuthStore((s) => s.setAuthenticated)

  useEffect(() => {
    const error = searchParams.get('error')
    const next = getSafeNext(searchParams.get('next')) ?? '/'
    const signInUrl = `/signin?error=google_auth_failed${
      next !== '/' ? `&next=${encodeURIComponent(next)}` : ''
    }`

    if (error) {
      router.replace(signInUrl)

      return
    }

    const { token, refreshToken } = getTokensFromHash()

    if (!token || !refreshToken) {
      router.replace(signInUrl)

      return
    }

    // useSessionBootstrap is suppressed on this page via the pathname check.
    // Exchange fragment tokens for HttpOnly cookies via the same-origin API route,
    // then fetch the current user from the backend-backed session.
    fetch('/api/auth/google/callback', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'same-origin',
      body: JSON.stringify({ token, refreshToken }),
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
