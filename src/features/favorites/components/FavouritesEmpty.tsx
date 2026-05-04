'use client'
import Image from 'next/image'
import search from '@/../public/search_cart.png'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/features/auth/store'

export default function FavouritesEmpty() {
  const router = useRouter()
  const isLoggedIn = useAuthStore((state) => state.status === 'authenticated')

  return (
    <div
      data-testid="favourites-empty"
      className="mx-auto flex max-w-[480px] flex-col items-center px-4 pt-10 pb-16 text-center"
    >
      <h1 className="mb-2 text-3xl font-bold tracking-tight text-black/80">
        Favourites
      </h1>
      <p className="mb-10 text-sm text-black/40">0 items</p>
      <Image
        src={search}
        width={160}
        height={137}
        alt="empty favourites"
        priority
        className="mb-8 opacity-60"
      />
      <p className="mb-1 text-lg font-semibold text-black/80">
        Nothing here yet
      </p>
      <p className="mb-8 text-sm text-black/40">
        Save products you love and find them here.
      </p>
      <div className="flex w-full max-w-[240px] flex-col gap-3">
        <Link
          href="/"
          className="flex h-[54px] items-center justify-center rounded-full bg-[#1B4332] font-semibold text-white shadow-md transition-colors hover:bg-[#143728]"
        >
          Start shopping
        </Link>
        {!isLoggedIn && (
          <button
            className="h-[54px] w-full rounded-full border-2 border-[#1B4332] bg-transparent font-semibold text-[#1B4332] shadow-sm transition-colors hover:bg-[#1B4332] hover:text-white"
            onClick={() => router.push('/signin')}
          >
            Log in
          </button>
        )}
      </div>
    </div>
  )
}
