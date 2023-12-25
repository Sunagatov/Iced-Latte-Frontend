'use client'

import FavouritesEmpty from './_components/FavouritesEmpty'
import FavouritesFull from './_components/FavouritesFull'
import { useFavouritesStore } from '@/store/favStore'

export default function Fav() {
  const { count } = useFavouritesStore()

  return <>{count > 0 ? <FavouritesFull /> : <FavouritesEmpty />}</>
}
