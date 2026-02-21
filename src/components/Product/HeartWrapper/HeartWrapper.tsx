'use client'
import ButtonHeart from '@/components/UI/Heart/ButtonHeart'
import { useAuthStore } from '@/store/authStore'
import { useFavouritesStore } from '@/store/favStore'
import { ButtonHeartProps } from '@/types/HeartWrapper'
import { handleFavouriteButtonClick } from '@/utils/favUtils'

export default function HeartWrapper({ id, className }: Readonly<ButtonHeartProps>) {
  const { addFavourite, removeFavourite, favourites, favouriteIds } = useFavouritesStore()
  const { token } = useAuthStore()

  const isFavourited = token ? favourites?.some((fav) => fav.id === id) : favouriteIds.includes(id)

  const handleButtonClick = async () => {
    await handleFavouriteButtonClick(id, token, isFavourited, addFavourite, removeFavourite)
  }

  return <ButtonHeart onClick={handleButtonClick} active={isFavourited} className={className} />

}
