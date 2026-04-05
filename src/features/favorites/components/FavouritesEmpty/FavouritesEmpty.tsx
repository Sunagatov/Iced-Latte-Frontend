'use client'
import Button from '@/shared/components/Buttons/Button/Button'
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
      <h1 className="text-primary mb-2 text-3xl font-bold tracking-tight">
        Favourites
      </h1>
      <p className="text-tertiary mb-10 text-sm">0 items</p>
      <Image
        src={search}
        width={160}
        height={137}
        alt="empty favourites"
        priority
        className="mb-8 opacity-60"
      />
      <p className="text-primary mb-1 text-lg font-semibold">
        Nothing here yet
      </p>
      <p className="text-tertiary mb-8 text-sm">
        Save products you love and find them here.
      </p>
      <div className="flex w-full max-w-[240px] flex-col gap-3">
        <Link href={'/'}>
          <Button
            id="continue-btn"
            className="h-[54px] w-full font-semibold shadow-md hover:brightness-110"
          >
            Browse Coffee
          </Button>
        </Link>
        {!isLoggedIn && (
          <Button
            className="border-brand-solid text-brand-solid hover:bg-brand-solid h-[54px] w-full border-2 bg-transparent font-semibold shadow-sm hover:text-white"
            id="login-btn"
            onClick={() => router.push('/signin')}
          >
            Log in
          </Button>
        )}
      </div>
    </div>
  )
}
