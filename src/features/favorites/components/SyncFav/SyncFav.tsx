'use client'
import FavouritesEmpty from '../FavouritesEmpty/FavouritesEmpty'
import FavouritesFull from '../FavouritesFull/FavouritesFull'
import { useFavouritesStore, FavStoreState } from '@/features/favorites/store'
import { AuthStore, useAuthStore } from '@/features/auth/store'
import { useEffect, useState } from 'react'

interface PersistApi { persist: { hasHydrated: () => boolean; onFinishHydration: (fn: () => void) => () => void } }

type TypedFavStore = { <T>(selector: (s: FavStoreState) => T): T }
type TypedAuthStore = { <T>(selector: (s: AuthStore) => T): T }

const authPersist = (useAuthStore as unknown as PersistApi).persist
const favPersist = (useFavouritesStore as unknown as PersistApi).persist
const selectFav = useFavouritesStore as unknown as TypedFavStore
const selectAuth = useAuthStore as unknown as TypedAuthStore

export default function SyncFav() {
  const favourites = selectFav((s) => s.favourites)
  const favouriteIds = selectFav((s) => s.favouriteIds)
  const getFavouriteProducts = selectFav((s) => s.getFavouriteProducts)
  const token = selectAuth((s) => s.token)
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
