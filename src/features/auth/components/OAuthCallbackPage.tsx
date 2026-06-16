'use client'

import { Suspense, useEffect, useRef } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuthStore } from '@/features/auth/public'
import { getUserData } from '@/features/user/public'
import { ROUTES } from '@/shared/config/routes'
import { getSafeNext } from '@/shared/utils/navigation'

const OAUTH_HANDOFF_CODE_RE = /^[A-Za-z0-9_-]{43}$/

function getOAuthCodeFromHash() {
  const hash = window.location.hash.startsWith('#')
    ? window.location.hash.slice(1)
    : window.location.hash
  const params = new URLSearchParams(hash)

  return params.get('oauthCode')
}

function buildSignInUrl(authFailedError: string, next: string): string {
  const params = new URLSearchParams({ error: authFailedError })

  if (next !== ROUTES.home) {
    params.set('next', next)
  }

  return `${ROUTES.signin}?${params.toString()}`
}

async function exchangeOAuthCode(oauthCode: string) {
  const response = await fetch(
    `/api/proxy/auth/oauth/token?code=${encodeURIComponent(oauthCode)}`,
    {
      method: 'POST',
      credentials: 'same-origin',
    },
  )

  if (!response.ok) {
    throw new Error('Failed to establish session')
  }

  return getUserData()
}

function OAuthCallbackInner({
  authFailedError,
}: {
  authFailedError: string
}) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const setAuthenticated = useAuthStore((s) => s.setAuthenticated)
  const hasStartedExchange = useRef(false)

  useEffect(() => {
    const error = searchParams.get('error')
    const next = getSafeNext(searchParams.get('next')) ?? ROUTES.home
    const signInUrl = buildSignInUrl(authFailedError, next)

    if (error) {
      router.replace(signInUrl)

      return
    }

    const oauthCode = getOAuthCodeFromHash()

    if (!oauthCode || !OAUTH_HANDOFF_CODE_RE.test(oauthCode)) {
      router.replace(signInUrl)

      return
    }

    if (hasStartedExchange.current) {
      return
    }

    hasStartedExchange.current = true

    // useSessionBootstrap is suppressed on this page via the pathname check.
    // Exchange the backend's one-time OAuth handoff code for HttpOnly cookies
    // via the same-origin proxy, then fetch the current user from the session.
    exchangeOAuthCode(oauthCode)
      .then((userData) => {
        setAuthenticated(userData)
        router.replace(next)
      })
      .catch(() => {
        router.replace(signInUrl)
      })
  }, [authFailedError, router, searchParams, setAuthenticated])

  return (
    <div className="flex min-h-screen items-center justify-center">
      <p className="text-sm text-[#64748B]">Signing you in…</p>
    </div>
  )
}

export default function OAuthCallbackPage({
  authFailedError,
}: {
  authFailedError: string
}) {
  return (
    <Suspense>
      <OAuthCallbackInner authFailedError={authFailedError} />
    </Suspense>
  )
}
