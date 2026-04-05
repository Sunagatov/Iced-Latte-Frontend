'use client'
import ButtonHeart from '@/shared/components/Heart/ButtonHeart'
import { useFavouritesStore } from '@/features/favorites/store'
interface ButtonHeartProps {
  id: string
  className?: string
}

export default function HeartWrapper({
  id,
  className,
}: Readonly<ButtonHeartProps>) {
  const toggleFavourite = useFavouritesStore((s) => s.toggleFavourite)
  const favouriteIds: string[] = useFavouritesStore((s) => s.favouriteIds)
  const pendingIds: Set<string> = useFavouritesStore((s) => s.pendingIds)

  const isFavourited = favouriteIds.includes(id)
  const isPending = pendingIds.has(id)

  return (
    <ButtonHeart
      active={isFavourited}
      className={className}
      disabled={isPending}
      onClick={() => {
        if (!isPending) void toggleFavourite(id)
      }}
    />
  )
}
