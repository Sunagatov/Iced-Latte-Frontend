'use client'

import ButtonHeart from '@/components/Heart/ButtonHeart'
import { IProduct } from '@/models/Products'
import { useFavouritesStore } from '@/store/favStore'

type FavElementProps = Pick<IProduct, 'id'>

export default function HeartWrapper({ id }: FavElementProps) {
  const { addFavourite } = useFavouritesStore()

  return (
    <ButtonHeart
      className="ml-2"
      active={true}
      onClick={() => addFavourite(id)}
    />
  )
}
