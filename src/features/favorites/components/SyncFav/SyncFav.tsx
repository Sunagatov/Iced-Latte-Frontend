'use client'
import FavouritesEmpty from '../FavouritesEmpty/FavouritesEmpty'
import FavouritesFull from '../FavouritesFull/FavouritesFull'
import { useFavouritesStore } from '@/features/favorites/store'
import { useAuthStore } from '@/features/auth/store'
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
      } catch {
        // ignore fetch errors
      }
    }

    void fetchData()
  }, [getFavouriteProducts, token])

  return <>
    {favourites && favourites.length > 0 || favouriteIds.length > 0 ? <FavouritesFull /> : <FavouritesEmpty />}
  </>
}

