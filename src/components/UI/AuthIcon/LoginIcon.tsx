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
          <div className="flex h-10 items-center justify-center rounded-[48px] bg-brand-solid px-6 text-lg font-semibold text-inverted shadow-md transition-all duration-200 hover:brightness-110 hover:shadow-lg active:scale-95 sm:h-12">
            Log in
          </div>
        </Link>
      )}
    </>
  )
}
