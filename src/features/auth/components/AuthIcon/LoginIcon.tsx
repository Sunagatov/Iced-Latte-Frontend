'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import type { AuthStore } from '@/features/auth/store'
import { useAuthStore } from '@/features/auth/store'
import UserBar from '@/features/user/components/UserBar'
import { ROUTES } from '@/shared/config/routes'

export default function LoginIcon() {
  const isLoggedIn = useAuthStore((state: AuthStore) => state.isLoggedIn)

  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return <div className="h-9 w-[92px]" />
  }

  return isLoggedIn ? (
    <Link className="inline-flex" href={ROUTES.profile}>
      <UserBar />
    </Link>
  ) : (
    <Link className="inline-flex" href={ROUTES.signin}>
      <div className="flex h-8 items-center justify-center rounded-full bg-brand-solid px-4 text-[13px] font-semibold text-white transition hover:bg-brand-solid-hover active:scale-[0.97]">
        Log in
      </div>
    </Link>
  )
}
