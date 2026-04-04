'use client'
import Link from 'next/link'
import { useFavouritesStore } from '@/features/favorites/store'

export default function HeaderHeart() {
  const { favouriteIds } = useFavouritesStore()

  return (
    <Link href={'/favourites'}>
      <div className="relative flex h-9 w-9 items-center justify-center rounded-full transition hover:bg-black/5">
        <svg className="h-5 w-5 text-primary" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
        </svg>
        {!!favouriteIds.length && (
          <div className="absolute right-0.5 top-0.5 flex min-w-4 h-4 items-center justify-center rounded-full bg-brand-solid px-1 text-[10px] font-bold text-white">
            {favouriteIds.length > 99 ? '99+' : favouriteIds.length}
          </div>
        )}
      </div>
    </Link>
  )
}
