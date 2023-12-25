'use client'

import Link from 'next/link'
import Image from 'next/image'
import black_heart from '../../public/black_heart.svg'
import purple_heart from '../../public/purple_heart.svg'
import { useFavouritesStore } from '@/store/favStore'
import { useRouter } from 'next/navigation'

export default function BlackHeartButton() {
  const { getFavouriteProducts, setClicked, isClicked } = useFavouritesStore()
  const router = useRouter()

  const handleClick = async () => {
    // Call the asynchronous action
    await getFavouriteProducts()

    // Update the state as clicked
    setClicked(true)

    // Navigate to the '/favourites' route after the state has been updated
    router.push('/favourites')
  }

  return (
    <Link href={'/favourites'}>
      <button
        onClick={handleClick}
        className={
          'relative flex items-center gap-2 rounded-full px-4 py-2 font-medium text-primary'
        }
      >
        <div className={'h-[20px] w-[20px] sm:h-[17px] sm:w-[16px]'}>
          <Image
            src={isClicked ? purple_heart : black_heart}
            width={20}
            height={20}
            alt="Cart"
            priority
          />
        </div>
      </button>
    </Link>
  )
}
