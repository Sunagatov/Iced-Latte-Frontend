import Image from 'next/image'
import active_heart from '../../../public/active_heart.svg'
import not_active_heart from '../../../public/not_active_heart.svg'
import { twMerge } from 'tailwind-merge'
import { useFavouritesStore } from '@/store/favStore'

type ButtonHeartProps = {
  className?: string
  id: string
}

export default function ButtonHeart({ id, className }: ButtonHeartProps) {
  const { addFavourite, removeFavourite, favouriteIds } = useFavouritesStore()

  const isActive = favouriteIds.includes(id)

  const handleButtonClick = () => {
    if (isActive) {
      removeFavourite(id)
    } else {
      addFavourite(id)
    }
  }

  const imageUrl = isActive ? active_heart : not_active_heart

  return (
    <button
      onClick={handleButtonClick}
      className={twMerge(
        'duration-400 flex h-[54px] w-[54px] cursor-pointer items-center justify-center rounded-full bg-secondary transition ease-in-out hover:bg-hover-heart',
        className,
      )}
    >
      <Image src={imageUrl} alt={`heart ${isActive ? 'liked' : 'unliked'}`} />
    </button>
  )
}
