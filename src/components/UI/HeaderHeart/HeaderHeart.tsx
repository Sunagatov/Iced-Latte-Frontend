'use client'
import Link from 'next/link'
import Image from 'next/image'
import heart_icon from '../../../../public/heart_icon.svg'
import { useFavouritesStore } from '@/store/favStore'

export default function HeaderHeart() {
  const { favouriteIds } = useFavouritesStore()

  return (
    <Link href={'/favourites'}>
      <div className="relative flex h-10 w-10 items-center justify-center rounded-full transition hover:bg-black/5">
        <Image src={heart_icon} alt="Favourites" priority />
        {!!favouriteIds.length && (
          <div className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-brand-solid text-[10px] font-bold text-white">
            {favouriteIds.length}
          </div>
        )}
      </div>
    </Link>
  )
}
