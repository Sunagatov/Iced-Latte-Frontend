'use client'

import Link from 'next/link'
import Image from 'next/image'
import black_heart from '../../public/black_heart.svg'
import active_heart from '../../public/active_heart.svg'
import { useFavouritesStore } from '@/store/favStore'
import { useStoreData } from '@/hooks/useStoreData'

export default function HeaderHeart() {

  const favouriteIds = useStoreData(useFavouritesStore, (state) => state.favouriteIds)
  let isEmpty = true

  if (favouriteIds) {
    isEmpty = favouriteIds.length === 0
  }


  return (
    <Link href={'/favourites'}>
      <button

        className={
          'relative flex items-center gap-2 rounded-full px-4 py-2 font-medium text-primary'
        }
      >
        <div className={'h-[24px] w-[24px] sm:h-[24px] sm:w-[24px]'}>
          <Image src={isEmpty ? black_heart : active_heart} alt={'heart'} />
        </div>
      </button>
    </Link>
  )
}
