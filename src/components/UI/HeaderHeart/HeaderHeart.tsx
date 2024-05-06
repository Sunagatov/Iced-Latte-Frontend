'use client'
import Link from 'next/link'
import Image from 'next/image'
import heart_black from '../../../../public/heart_black.svg'
import heart_purple from '../../../../public/heart_purple.svg'

import { useFavouritesStore } from '@/store/favStore'

export default function HeaderHeart() {
  const { favouriteIds } = useFavouritesStore()

  return (
    <Link href={'/favourites'}>
      <button
        className={
          'relative flex items-center  gap-2 rounded-full px-4 font-medium text-primary'
        }
      >
        <div className="flex flex-col items-center">
          <div
            className={
              'flex h-[24px] w-[24px] justify-center sm:mb-2 sm:h-[24px] sm:w-[24px]'
            }
          >
            <Image
              src={favouriteIds.length > 0 ? heart_purple : heart_black}
              alt={'heart'}
              className="flex"
            />
          </div>
          <p className="hidden items-center text-primary text-opacity-50 sm:flex">
            favorites
          </p>
        </div>
      </button>
    </Link>
  )
}
