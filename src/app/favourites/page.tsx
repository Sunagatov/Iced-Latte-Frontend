'use client'
import FavouritesEmpty from '../../components/Favourites/FavouritesEmpty/FavouritesEmpty'
import FavouritesFull from '../../components/Favourites/FavouritesFull/FavouritesFull'
import { useEffect } from 'react'
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

