'use client'

import Link from 'next/link'
import UserBar from '../UserBar/UserBar'
import { useAuthStore } from '@/store/authStore'
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
          <div className="flex h-10 items-center justify-center rounded-[48px] bg-brand-solid px-6  text-lg text-inverted sm:h-12">
            Log in
          </div>
        </Link>
      )}
    </>
  )
}
