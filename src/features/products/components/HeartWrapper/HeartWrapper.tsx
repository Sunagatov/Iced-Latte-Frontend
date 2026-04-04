'use client'
import ButtonHeart from '@/shared/components/Heart/ButtonHeart'
import { useAuthStore } from '@/features/auth/store'
import { useFavouritesStore } from '@/features/favorites/store'
interface ButtonHeartProps { id: string; className?: string }

export default function HeartWrapper({ id, className }: Readonly<ButtonHeartProps>) {
  const { toggleFavourite, favouriteIds } = useFavouritesStore()
  const { token } = useAuthStore()

  const isFavourited = favouriteIds.includes(id)

  const handleButtonClick = () => { void toggleFavourite(id, token) }

  return <ButtonHeart onClick={handleButtonClick} active={isFavourited} className={className} />

}
