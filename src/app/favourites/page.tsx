'use client'

import { useEffect } from 'react'
import FavouritesEmpty from './_components/FavouritesEmpty'
import FavouritesFull from './_components/FavouritesFull'
import { useFavouritesStore } from '@/store/favStore'
import { useAuthStore } from '@/store/authStore'

export default function Fav() {
  const { getFavouriteProducts, favouriteIds, syncBackendFav } = useFavouritesStore()

  const { token } = useAuthStore()


  useEffect(() => {
    if (token) {
      syncBackendFav(token).catch((e) => console.log(e))
    }

    getFavouriteProducts().catch((e) => console.log(e))
  }, [favouriteIds, token])



  return <>{favouriteIds.length > 0 ? <FavouritesFull /> : <FavouritesEmpty />}</>
}
