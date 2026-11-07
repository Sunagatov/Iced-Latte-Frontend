'use client'
import FavouritesEmpty from './FavouritesEmpty'
import FavouritesFull from './FavouritesFull'
import FavouritesSkeleton from './FavouritesSkeleton'
import {
  useFavouritesStore,
  type FavStatus,
  type FavStoreState,
} from '@/features/favorites/public'
import { useAuthStore, AuthStatus } from '@/features/auth/public'
import type { FavoriteProduct } from '@/features/favorites/favoritesTypes'
import { useEffect, useState } from 'react'
import GuestDraftReview from '@/features/session/GuestDraftReview'

interface PersistApi {
  persist: {
    hasHydrated: () => boolean
    onFinishHydration: (fn: () => void) => () => void
  }
}

export default function FavouritesPage() {
  const favPersist = (useFavouritesStore as unknown as PersistApi).persist
  const favourites: FavoriteProduct[] = useFavouritesStore(
    (s: FavStoreState): FavoriteProduct[] => s.favourites,
  )
  const status: FavStatus = useFavouritesStore((s) => s.status)
  const hydrate: () => Promise<void> = useFavouritesStore((s) => s.hydrate)
  const authStatus: AuthStatus = useAuthStore((s) => s.status)
  const draft = useFavouritesStore((state) => state.guestConflict)
  const editDraft = useFavouritesStore((state) => state.editGuestDraft)
  const retryDraft = useFavouritesStore((state) => state.retryGuestDraft)
  const hasPersistHydrated = () => favPersist?.hasHydrated?.() ?? true
  const [hydrated, setHydrated] = useState(hasPersistHydrated)

  // Only fav store is persisted; auth state resolves during app session bootstrap.
  useEffect(() => {
    if (favPersist?.hasHydrated?.() ?? true) {
      setHydrated(true)

      return
    }

    return favPersist?.onFinishHydration(() => setHydrated(true))
  }, [favPersist])

  // Guest-only fetch — app session bootstrap owns authenticated sync.
  useEffect(() => {
    if (!hydrated) return
    if (authStatus === 'loading') return
    if (authStatus === 'authenticated') return
    void hydrate()
  }, [hydrate, authStatus, hydrated])

  if (
    authStatus === 'loading' ||
    !hydrated ||
    status === 'idle' ||
    status === 'syncing'
  )
    return <FavouritesSkeleton />

  if (status === 'error') {
    return (
      <div className="flex flex-col items-center gap-3 pt-20 text-center">
        <p className="text-sm text-black/40">Couldn&apos;t load favourites</p>
        <button
          className="bg-brand-solid hover:bg-brand-solid-hover rounded-full px-4 py-2 text-sm font-semibold text-white"
          onClick={() => void hydrate()}
        >
          Retry
        </button>
      </div>
    )
  }

  return (
    <>
      {draft && (
        <GuestDraftReview
          message={draft.message}
          busy={false}
          entries={draft.productIds.map((id) => ({
            id,
            label:
              draft.names?.[id] ??
              favourites.find((product) => product.id === id)?.name ??
              `Unavailable product (${id.slice(0, 8)})`,
          }))}
          onRemove={(id) =>
            editDraft(draft.productIds.filter((productId) => productId !== id))
          }
          onDiscard={() => editDraft([])}
          onRetry={() => {
            void retryDraft().catch(() => {})
          }}
        />
      )}
      {favourites.length > 0 ? <FavouritesFull /> : <FavouritesEmpty />}
    </>
  )
}
