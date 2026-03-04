'use client'

import Link from 'next/link'
import UserBar from '../UserBar/UserBar'
import { useAuthStore } from '@/features/auth/store'
export default function LoginIcon() {
  const isLoggedIn = useAuthStore((state) => state.isLoggedIn)

  return (
    <>
      {isLoggedIn ? (
        <Link href={'/profile'} className="inline-flex">
          <UserBar />
        </Link>
      ) : (
        <Link
          href={'/signin'}
          className="inline-flex"
        >
          <div className="flex h-9 items-center justify-center rounded-full bg-brand-solid px-5 text-sm font-semibold text-white transition hover:bg-brand-solid-hover active:scale-95">
            Log in
          </div>
        </Link>
      )}
    </>
  )
}
