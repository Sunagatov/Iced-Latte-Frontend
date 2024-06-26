'use client'
import Link from 'next/link'
import Image from 'next/image'
import heart_icon from '../../../../public/heart_icon.svg'
import { useFavouritesStore } from '@/store/favStore'

export default function HeaderHeart() {
  const { favouriteIds } = useFavouritesStore()

  return (
    <Link href={'/favourites'}>
      <div className="relative flex h-12 w-12 items-center justify-center gap-2 sm:pt-2">
        <div className="flex flex-col items-center">
          <Image src={heart_icon} alt="heart" priority />
          <p className=" hidden font-medium text-primary text-opacity-50 sm:flex ">
            favorites
          </p>
        </div>
        {!!favouriteIds.length && (
          <div className=" absolute right-[8px] top-[8px] flex h-4 w-4 items-center justify-center rounded-full border bg-brand-solid  p-1 shadow-header sm:right-[4px] sm:top-[-2px] sm:h-5 sm:w-5 ">
            <span className="text-[12px] font-bold text-white sm:text-[14px]">
              {favouriteIds.length}
            </span>
          </div>
        )}
      </div>
    </Link>
  )
}
