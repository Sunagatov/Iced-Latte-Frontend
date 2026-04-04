'use client'
import FavouritesEmpty from '../FavouritesEmpty/FavouritesEmpty'
import FavouritesFull from '../FavouritesFull/FavouritesFull'
import Loader from '@/shared/components/Loader/Loader'
import { useFavouritesStore } from '@/features/favorites/store'
import { useAuthStore } from '@/features/auth/store'
import { useEffect, useState } from 'react'

interface PersistApi { persist: { hasHydrated: () => boolean; onFinishHydration: (fn: () => void) => () => void } }

export default function SyncFav() {
  const favourites = useFavouritesStore((s) => s.favourites)
  const getFavouriteProducts = useFavouritesStore((s) => s.getFavouriteProducts)
  const token = useAuthStore((s) => s.token)
  const [hydrated, setHydrated] = useState(false)
  const [fetched, setFetched] = useState(false)

  useEffect(() => {
    const authPersist = (useAuthStore as unknown as PersistApi).persist
    const favPersist = (useFavouritesStore as unknown as PersistApi).persist
    let authDone = authPersist.hasHydrated()
    let favDone = favPersist.hasHydrated()

    if (authDone && favDone) {
      setHydrated(true)

      return
    }

    const unsubAuth = authPersist.onFinishHydration(() => { authDone = true; if (favDone) setHydrated(true) })
    const unsubFav = favPersist.onFinishHydration(() => { favDone = true; if (authDone) setHydrated(true) })

    return () => { unsubAuth(); unsubFav() }
  }, [])

  useEffect(() => {
    if (!hydrated) return

    if (token) { setFetched(true)

      return }

    const fetchData = async (): Promise<void> => {
      try {
        await getFavouriteProducts(null)
      } catch {
        // ignore fetch errors
      } finally {
        setFetched(true)
      }
    }

    void fetchData()
  }, [getFavouriteProducts, token, hydrated])

  if (!hydrated || !fetched) return <Loader />

  return <>
    {favourites.length > 0 ? <FavouritesFull /> : <FavouritesEmpty />}
  </>
}
