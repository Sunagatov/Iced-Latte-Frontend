'use client'

import Link from 'next/link'
import UserBar from '../UserBar/UserBar'
import { useAuthStore } from '@/features/auth/store'
import { useEffect, useState } from 'react'
import { getTokenFromBrowserCookie, isTokenExpired } from '@/shared/utils/authToken'

export default function LoginIcon() {
  const isLoggedIn = useAuthStore((state) => state.isLoggedIn)
  const token = useAuthStore((state) => state.token)

  const [mounted, setMounted] = useState(false)
  const [hasValidCookieToken, setHasValidCookieToken] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    const cookieToken = getTokenFromBrowserCookie()
    setHasValidCookieToken(!!cookieToken && !isTokenExpired(cookieToken))
  }, [isLoggedIn, token])

  if (!mounted) {
    return <div className="h-9 w-[92px]" />
  }

  const shouldShowProfile = isLoggedIn || hasValidCookieToken

  return shouldShowProfile ? (
    <Link href="/profile" className="inline-flex">
      <UserBar />
    </Link>
  ) : (
    <Link href="/signin" className="inline-flex">
      <div className="flex h-9 items-center justify-center rounded-full bg-brand-solid px-5 text-sm font-semibold text-white transition hover:bg-brand-solid-hover active:scale-95">
        Log in
      </div>
    </Link>
  )
}