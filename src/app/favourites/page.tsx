'use client'

import FavouritesEmpty from './_components/FavouritesEmpty'
import FavouritesFull from './_components/FavouritesFull'
import { useStoreData } from '@/hooks/useStoreData'
import { useFavouritesStore } from '@/store/favStore'

export default function Fav() {
  const count = useStoreData(useFavouritesStore, (state) => state.count)

  return <>{count ? <FavouritesFull /> : <FavouritesEmpty />}</>
}
