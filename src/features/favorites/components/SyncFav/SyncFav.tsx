'use client'
import FavouritesEmpty from '../FavouritesEmpty/FavouritesEmpty'
import FavouritesFull from '../FavouritesFull/FavouritesFull'
import { useFavouritesStore } from '@/features/favorites/store'
import { useAuthStore } from '@/features/auth/store'
import { useEffect, useState } from 'react'

export default function SyncFav() {
  const favourites = useFavouritesStore((s) => s.favourites)
  const favouriteIds = useFavouritesStore((s) => s.favouriteIds)
  const getFavouriteProducts = useFavouritesStore((s) => s.getFavouriteProducts)
  const { token } = useAuthStore()
  const [hydrated, setHydrated] = useState(false)
  const [fetched, setFetched] = useState(false)

  useEffect(() => {
    // Wait for both auth and fav stores to finish hydrating before reading token/favouriteIds.
    // If only authStore is awaited, fav-storage may not be ready yet and getFavouriteProducts
    // fires with token=null (guest path), missing the real persisted favouriteIds entirely.
    let authDone = useAuthStore.persist.hasHydrated()
    let favDone = useFavouritesStore.persist.hasHydrated()

    if (authDone && favDone) {
      setHydrated(true)
      return
    }

    const unsubAuth = useAuthStore.persist.onFinishHydration(() => {
      authDone = true
      if (favDone) setHydrated(true)
    })
    const unsubFav = useFavouritesStore.persist.onFinishHydration(() => {
      favDone = true
      if (authDone) setHydrated(true)
    })

    return () => {
      unsubAuth()
      unsubFav()
    }
  }, [])

  useEffect(() => {
    if (!hydrated) return
    const fetchData = async (): Promise<void> => {
      try {
        await getFavouriteProducts(token)
      } catch {
        // ignore fetch errors
      } finally {
        setFetched(true)
      }
    }

    void fetchData()
  }, [getFavouriteProducts, token, hydrated])

  if (!hydrated || !fetched) return null

  return <>
    {favourites && favourites.length > 0 || favouriteIds.length > 0 ? <FavouritesFull /> : <FavouritesEmpty />}
  </>
}

