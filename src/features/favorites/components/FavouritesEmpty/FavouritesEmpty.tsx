'use client'
import Button from '@/shared/components/Buttons/Button/Button'
import Image from 'next/image'
import search from '@/../public/search_cart.png'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/features/auth/store'

export default function FavouritesEmpty() {
  const router = useRouter()


  return (
    <div data-testid="favourites-empty" className="mx-auto flex max-w-[480px] flex-col items-center px-4 pt-10 pb-16 text-center">
      <h1 className="mb-2 text-3xl font-bold tracking-tight text-primary">Favourites</h1>
      <p className="mb-10 text-sm text-tertiary">0 items</p>
      <Image src={search} width={160} height={137} alt="empty favourites" priority className="mb-8 opacity-60" />
      <p className="mb-1 text-lg font-semibold text-primary">Nothing here yet</p>
      <p className="mb-8 text-sm text-tertiary">Save products you love and find them here.</p>
      <div className="flex flex-col gap-3 w-full max-w-[240px]">
        <Link href={'/'}>
          <Button id="continue-btn" className="h-[54px] w-full font-semibold shadow-md hover:brightness-110">
            Browse Coffee
          </Button>
        </Link>
        <Button
          id="login-btn"
          onClick={() => router.push('/signin')}
          className="h-[54px] w-full border-2 border-brand-solid bg-transparent font-semibold text-brand-solid shadow-sm hover:bg-brand-solid hover:text-white"
        >
          Log in
        </Button>
      </div>
    </div>
  )
}
