'use client'

import { useEffect } from 'react'
import FavouritesEmpty from './_components/FavouritesEmpty'
import FavouritesFull from './_components/FavouritesFull'
import { useFavouritesStore } from '@/store/favStore'

export default function Fav() {
  const { getFavouriteProducts, favouriteIds } = useFavouritesStore()

  useEffect(() => {
    getFavouriteProducts().catch((e) => console.log(e))
  }, [favouriteIds])

  return <>{favouriteIds.length > 0 ? <FavouritesFull /> : <FavouritesEmpty />}</>
}
