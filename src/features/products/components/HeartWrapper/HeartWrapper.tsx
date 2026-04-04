'use client'
import ButtonHeart from '@/shared/components/Heart/ButtonHeart'
import { useAuthStore } from '@/features/auth/store'
import { useFavouritesStore } from '@/features/favorites/store'
interface ButtonHeartProps { id: string; className?: string }

export default function HeartWrapper({ id, className }: Readonly<ButtonHeartProps>) {
  const { toggleFavourite, favouriteIds, pendingIds } = useFavouritesStore()
  const { token } = useAuthStore()

  const isFavourited = favouriteIds.includes(id)
  const isPending = pendingIds.has(id)

  const handleButtonClick = () => { if (!isPending) void toggleFavourite(id, token) }

  return <ButtonHeart onClick={handleButtonClick} active={isFavourited} disabled={isPending} className={className} />
}
