'use client'

import { useEffect } from 'react'
import FavouritesEmpty from './_components/FavouritesEmpty'
import FavouritesFull from './_components/FavouritesFull'
import { useFavouritesStore } from '@/store/favStore'

export default function Fav() {
  const { count, getFavouriteProducts } = useFavouritesStore()

  useEffect(() => {
    getFavouriteProducts().catch((e) => console.log(e))
  }, [])

  return <>{count > 0 ? <FavouritesFull /> : <FavouritesEmpty />}</>
}
