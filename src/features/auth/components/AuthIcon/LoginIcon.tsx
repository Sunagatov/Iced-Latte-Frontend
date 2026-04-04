'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import type { AuthStore } from '@/features/auth/store'
import { useAuthStore } from '@/features/auth/store'
import UserBar from '@/features/user/components/UserBar/UserBar'

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