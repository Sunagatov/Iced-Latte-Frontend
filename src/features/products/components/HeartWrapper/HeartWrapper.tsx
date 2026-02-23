'use client'
import ButtonHeart from '@/shared/components/Heart/ButtonHeart'
import { useAuthStore } from '@/features/auth/store'
import { useFavouritesStore } from '@/features/favorites/store'
interface ButtonHeartProps { id: string; className?: string }
import { handleFavouriteButtonClick } from '@/shared/utils/favUtils'

export default function HeartWrapper({ id, className }: Readonly<ButtonHeartProps>) {
  const { addFavourite, removeFavourite, favourites, favouriteIds } = useFavouritesStore()
  const { token } = useAuthStore()

  const isFavourited = token ? favourites?.some((fav) => fav.id === id) : favouriteIds.includes(id)

  const handleButtonClick = async () => {
    await handleFavouriteButtonClick(id, token, isFavourited, addFavourite, removeFavourite)
  }

  return <ButtonHeart onClick={handleButtonClick} active={isFavourited} className={className} />

}
