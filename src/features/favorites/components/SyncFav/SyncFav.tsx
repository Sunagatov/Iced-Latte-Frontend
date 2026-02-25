'use client'
import FavouritesEmpty from '../FavouritesEmpty/FavouritesEmpty'
import FavouritesFull from '../FavouritesFull/FavouritesFull'
import { useFavouritesStore } from '@/features/favorites/store'
import { useAuthStore } from '@/features/auth/store'
import { useEffect, useState } from 'react'

export default function SyncFav() {
  const { favourites, favouriteIds, getFavouriteProducts } = useFavouritesStore()
  const { token } = useAuthStore()
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    // Wait for Zustand persist hydration before reading token
    const unsub = useAuthStore.persist.onFinishHydration(() => setHydrated(true))
    if (useAuthStore.persist.hasHydrated()) setHydrated(true)
    return unsub
  }, [])

  useEffect(() => {
    if (!hydrated) return
    const fetchData = async (): Promise<void> => {
      try {
        await getFavouriteProducts(token)
      } catch {
        // ignore fetch errors
      }
    }

    void fetchData()
  }, [getFavouriteProducts, token, hydrated])

  return <>
    {favourites && favourites.length > 0 || favouriteIds.length > 0 ? <FavouritesFull /> : <FavouritesEmpty />}
  </>
}

