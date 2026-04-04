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
  const authStatus = useAuthStore((s) => s.status)
  const [hydrated, setHydrated] = useState(false)

  // Only fav store is persisted; auth store resolves via session fetch in AppInitProvider
  useEffect(() => {
    const favPersist = (useFavouritesStore as unknown as PersistApi).persist

    if (favPersist.hasHydrated()) {
      setHydrated(true)

      return
    }

    return favPersist.onFinishHydration(() => setHydrated(true))
  }, [])

  // Guest-only fetch — AppInitProvider owns authenticated sync
  useEffect(() => {
    if (!hydrated) return
    if (authStatus === 'loading') return
    if (authStatus === 'authenticated') return
    void getFavouriteProducts()
  }, [getFavouriteProducts, authStatus, hydrated])

  if (!hydrated || status === 'idle' || status === 'syncing') return <FavouritesSkeleton />

  if (status === 'error') {
    return (
      <div className="flex flex-col items-center gap-3 pt-20 text-center">
        <p className="text-sm text-tertiary">Couldn&apos;t load favourites</p>
        <button
          onClick={() => void getFavouriteProducts()}
          className="rounded-full bg-brand-solid px-4 py-2 text-sm font-semibold text-inverted hover:bg-brand-solid-hover"
        >
          Retry
        </button>
      </div>
    )
  }

  return <>{favourites.length > 0 ? <FavouritesFull /> : <FavouritesEmpty />}</>
}
