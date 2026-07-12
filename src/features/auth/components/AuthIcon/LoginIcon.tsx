'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import type { AuthStore } from '@/features/auth/public'
import { useAuthStore } from '@/features/auth/public'
import { ROUTES } from '@/shared/config/routes'

export default function LoginIcon() {
  const status = useAuthStore((state: AuthStore) => state.status)
  const isLoggedIn = useAuthStore((state: AuthStore) => state.isLoggedIn)
  const userData = useAuthStore((state: AuthStore) => state.userData)

  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted || status === 'loading') {
    return <div className="h-9 w-[92px]" />
  }

  const userInitials =
    `${userData?.firstName?.[0] ?? ''}${userData?.lastName?.[0] ?? ''}` || '?'

  return isLoggedIn ? (
    <Link className="inline-flex" href={ROUTES.profile}>
      <div
        id="user-btn"
        className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-solid text-[11px] font-bold text-white transition hover:bg-brand-solid-hover"
      >
        {userInitials.toUpperCase()}
      </div>
    </Link>
  ) : (
    <Link className="inline-flex" href={ROUTES.signin}>
      <div className="flex h-8 items-center justify-center rounded-full bg-brand-solid px-4 text-[13px] font-semibold text-white transition hover:bg-brand-solid-hover active:scale-[0.97]">
        Log in
      </div>
    </Link>
  )
}
