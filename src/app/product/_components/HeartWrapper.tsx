'use client'

import ButtonHeart from '@/components/Heart/ButtonHeart'
import { useFavouritesStore } from '@/store/favStore'

type ButtonHeartProps = {
  className?: string
  id: string
}

export default function HeartWrapper({ id, className }: Readonly<ButtonHeartProps>) {

  const { addFavourite, removeFavourite, favouriteIds } = useFavouritesStore()

  const isActive = favouriteIds.includes(id)

  const handleButtonClick = () => {
    if (isActive) {
      removeFavourite(id)
    } else {
      addFavourite(id)
    }
  }

  return <ButtonHeart onClick={handleButtonClick} active={isActive} className={className} />
}
