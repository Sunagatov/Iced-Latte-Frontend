
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
    const fetchData = async (): Promise<void> => {
      try {
        if (token) {
          await syncBackendFav(token)
        } else {
          await getFavouriteProducts()
        }
      } catch (error) {
        console.error('Error in Fav useEffect:', error)
      }
    }

    void fetchData()
  }, [getFavouriteProducts, syncBackendFav, token])


  return <>
    {favouriteIds.length > 0 ? <FavouritesFull /> : <FavouritesEmpty />}
  </>


}

