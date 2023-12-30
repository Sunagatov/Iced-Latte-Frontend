'use client'

import ButtonHeart from '@/components/Heart/ButtonHeart'
import { useAuthStore } from '@/store/authStore'
import { useFavouritesStore } from '@/store/favStore'

type ButtonHeartProps = {
  className?: string
  id: string
}

export default function HeartWrapper({ id, className }: Readonly<ButtonHeartProps>) {

  const { addFavourite, removeFavourite, favouriteIds } = useFavouritesStore()

  const isActive = favouriteIds.includes(id)
  const { token } = useAuthStore()

  const handleButtonClick = async () => {
    try {
      if (isActive) {
        await removeFavourite(id, token)
      } else {
        await addFavourite(id, token)
      }
    } catch (error) {
      console.error('Error in handleButtonClick:', error)
    }
  }


  return <ButtonHeart onClick={handleButtonClick} active={isActive} className={className} />

}
