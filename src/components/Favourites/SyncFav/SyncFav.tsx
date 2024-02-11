'use client'
import FavouritesEmpty from '../FavouritesEmpty/FavouritesEmpty'
import FavouritesFull from '../FavouritesFull/FavouritesFull'
import { useFavouritesStore } from '@/store/favStore'
import { useAuthStore } from '@/store/authStore'
import { useEffect } from 'react'

export default function SyncFav() {
  const { favourites, favouriteIds, getFavouriteProducts } = useFavouritesStore()

  const { token } = useAuthStore()

  useEffect(() => {
    const fetchData = async (): Promise<void> => {
      try {
        if (!token) {
          await getFavouriteProducts(token)
        }
      } catch (error) {
        console.error('Error in Fav useEffect:', error)
      }
    }

    void fetchData()
  }, [getFavouriteProducts, token])

  return <>
    {favourites && favourites.length > 0 || favouriteIds.length > 0 ? <FavouritesFull /> : <FavouritesEmpty />}
  </>
}

