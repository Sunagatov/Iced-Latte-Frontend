'use client'
import FavouritesEmpty from '../FavouritesEmpty/FavouritesEmpty'
import FavouritesFull from '../FavouritesFull/FavouritesFull'
import { useFavouritesStore } from '@/features/favorites/store'
import { useAuthStore } from '@/features/auth/store'
import { useEffect, useState } from 'react'

interface PersistApi { persist: { hasHydrated: () => boolean; onFinishHydration: (cb: () => void) => () => void } }

const authPersist = (useAuthStore as unknown as PersistApi).persist
const favPersist = (useFavouritesStore as unknown as PersistApi).persist

export default function SyncFav() {
  const favourites = useFavouritesStore((s) => s.favourites)
  const favouriteIds = useFavouritesStore((s) => s.favouriteIds)
  const getFavouriteProducts = useFavouritesStore((s) => s.getFavouriteProducts)
  const token = useAuthStore((s) => s.token)
  const [hydrated, setHydrated] = useState(false)
  const [fetched, setFetched] = useState(false)

  useEffect(() => {
    let authDone = authPersist.hasHydrated()
    let favDone = favPersist.hasHydrated()

    if (authDone && favDone) {
      setHydrated(true)

      return
    }

    const unsubAuth = authPersist.onFinishHydration(() => {
      authDone = true
      if (favDone) setHydrated(true)
    })
    const unsubFav = favPersist.onFinishHydration(() => {
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
