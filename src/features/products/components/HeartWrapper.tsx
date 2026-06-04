'use client'
import { useFavoriteProductActions } from '@/features/favorites/public'
import ButtonHeart from '@/features/products/components/ButtonHeart'
interface ButtonHeartProps {
  id: string
  className?: string
}

export default function HeartWrapper({
  id,
  className,
}: Readonly<ButtonHeartProps>) {
  const { handleToggleFavourite, isFavourited, isPending } =
    useFavoriteProductActions(id)

  return (
    <ButtonHeart
      active={isFavourited}
      className={className}
      disabled={isPending}
      onClick={handleToggleFavourite}
    />
  )
}
