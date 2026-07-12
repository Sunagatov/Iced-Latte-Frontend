'use client'
import { useFavoriteProductActions } from '@/features/favorites/public'
import ButtonHeart from '@/features/products/components/ButtonHeart'
interface ButtonHeartProps {
  id: string
  className?: string
  brandName?: string | null
  name?: string
  price?: number
}

export default function HeartWrapper({
  id,
  className,
  brandName,
  name,
  price,
}: Readonly<ButtonHeartProps>) {
  const { handleToggleFavourite, isFavourited, isPending } =
    useFavoriteProductActions(id, { brandName, name, price })

  return (
    <ButtonHeart
      active={isFavourited}
      className={className}
      disabled={isPending}
      onClick={handleToggleFavourite}
    />
  )
}
