'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import type { AuthStore } from '@/features/auth/store'
import { useAuthStore } from '@/features/auth/store'
import UserBar from '@/features/user/components/UserBar/UserBar'
import { getTokenFromBrowserCookie, isTokenExpired } from '@/shared/utils/authToken'

export default function LoginIcon() {
  const isLoggedIn = useAuthStore((state: AuthStore) => state.isLoggedIn)
  const token = useAuthStore((state: AuthStore) => state.token)

  const [mounted, setMounted] = useState(false)
  const [hasValidCookieToken, setHasValidCookieToken] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    const cookieToken = getTokenFromBrowserCookie()

    setHasValidCookieToken(Boolean(cookieToken) && !isTokenExpired(cookieToken))
  }, [isLoggedIn, token])

  if (!mounted) {
    return <div className="h-9 w-[92px]" />
  }

  const shouldShowProfile = isLoggedIn || hasValidCookieToken

  return shouldShowProfile ? (
    <Link className="inline-flex" href="/profile">
      <UserBar />
    </Link>
  ) : (
    <Link className="inline-flex" href="/signin">
      <div className="flex h-9 items-center justify-center rounded-full bg-brand-solid px-5 text-sm font-semibold text-white transition hover:bg-brand-solid-hover active:scale-95">
        Log in
      </div>
    </Link>
  )
}