'use client'
import FavouritesEmpty from '../FavouritesEmpty/FavouritesEmpty'
import FavouritesFull from '../FavouritesFull/FavouritesFull'
import FavouritesSkeleton from '../FavouritesSkeleton/FavouritesSkeleton'
import { useFavouritesStore } from '@/features/favorites/store'
import { useAuthStore } from '@/features/auth/store'
import { useEffect, useState } from 'react'

interface PersistApi { persist: { hasHydrated: () => boolean; onFinishHydration: (fn: () => void) => () => void } }

export default function FavouritesPage() {
  const favourites = useFavouritesStore((s) => s.favourites)
  const status = useFavouritesStore((s) => s.status)
  const getFavouriteProducts = useFavouritesStore((s) => s.getFavouriteProducts)
  const token = useAuthStore((s) => s.token)
  const [hydrated, setHydrated] = useState(false)

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
    if (token) return // AppInitProvider owns authenticated sync
    void getFavouriteProducts(null)
  }, [getFavouriteProducts, token, hydrated])

  if (!hydrated || status === 'idle' || status === 'syncing') return <FavouritesSkeleton />

  if (status === 'error') {
    return (
      <div className="flex flex-col items-center gap-3 pt-20 text-center">
        <p className="text-sm text-tertiary">Couldn&apos;t load favourites</p>
        <button
          onClick={() => void getFavouriteProducts(token)}
          className="rounded-full bg-brand-solid px-4 py-2 text-sm font-semibold text-inverted hover:bg-brand-solid-hover"
        >
          Retry
        </button>
      </div>
    )
  }

  return <>{favourites.length > 0 ? <FavouritesFull /> : <FavouritesEmpty />}</>
}
