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
    <div className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top,_rgba(240,247,244,0.95),_rgba(255,255,255,1)_55%)] px-6 py-16">
      <div className="w-full max-w-md rounded-[28px] border border-slate-200/80 bg-white/95 p-8 shadow-[0_24px_80px_rgba(15,23,42,0.10)] backdrop-blur">
        <div className="mb-5 flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-second text-brand">
            <span
              aria-hidden="true"
              className="h-5 w-5 animate-spin rounded-full border-2 border-brand/30 border-t-brand-solid"
            />
          </div>
          <div>
            <p className="text-xs font-semibold tracking-[0.18em] text-slate-400 uppercase">
              Secure Sign-In
            </p>
            <h1 className="text-xl font-semibold text-slate-950">
              Finishing your session
            </h1>
          </div>
        </div>

        <div
          aria-live="polite"
          className="rounded-2xl bg-slate-50 px-4 py-4"
        >
          <p className="text-sm font-medium text-slate-900">
            Verifying your account and preparing your session.
          </p>
          <p className="mt-1 text-sm leading-6 text-slate-500">
            This should only take a moment. You&apos;ll be redirected automatically when everything is ready.
          </p>
        </div>

        <div className="mt-5 flex items-center gap-2 text-xs text-slate-500">
          <span className="h-2 w-2 rounded-full bg-emerald-500" />
          No tokens are exposed in the browser URL.
        </div>
      </div>
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
