import { useAuthStore } from '@/features/auth/store'
import {
  fetchFavourites,
  syncFavourites,
} from '@/features/favorites/favoritesApi'
import {
  type FavStoreGet,
  type FavStoreSet,
  mapProductsToFavourites,
  normalizeProducts,
  uniqueIds,
} from '@/features/favorites/state/favoritesStore.utils'
import { getProductByIds } from '@/features/products/api'

function isAbortError(err: unknown): boolean {
  return (
    (err as { name?: string }).name === 'AbortError' ||
    (err as { name?: string }).name === 'CanceledError'
  )
}

export async function hydrateFavouritesStore(
  set: FavStoreSet,
  get: FavStoreGet,
  signal?: AbortSignal,
): Promise<void> {
  const isAuthenticated = useAuthStore.getState().status === 'authenticated'

  set({ status: 'syncing' })

  try {
    if (isAuthenticated) {
      const products = await fetchFavourites(signal)

      if (signal?.aborted) {
        return
      }

      const incoming = normalizeProducts(products)

      if (incoming.length === 0 && get().favouriteIds.length > 0 && !get().isSync) {
        set({ status: 'ready' })

        return
      }

      set({
        ...mapProductsToFavourites(products),
        isSync: incoming.length > 0,
        status: 'ready',
      })

      return
    }

    if (get().favouriteIds.length === 0) {
      set({ favouriteIds: [], favourites: [], status: 'ready' })

      return
    }

    const products = await getProductByIds(get().favouriteIds)

    set({ ...mapProductsToFavourites(products), status: 'ready' })
  } catch (err) {
    if (isAbortError(err)) {
      return
    }

    set({ status: 'error' })
  }
}

export async function syncFavouritesStoreWithSession(
  set: FavStoreSet,
  get: FavStoreGet,
  signal?: AbortSignal,
): Promise<void> {
  const authStatus = useAuthStore.getState().status

  if (authStatus === 'anonymous') {
    if (get().isSync) {
      set({
        favouriteIds: [],
        favourites: [],
        isSync: false,
        pendingIds: new Set<string>(),
        status: 'idle',
      })

      return
    }

    if (get().favouriteIds.length > 0) {
      await hydrateFavouritesStore(set, get, signal)
    }

    return
  }

  if (!get().isSync && get().favouriteIds.length > 0) {
    await syncGuestFavouritesIntoBackend(set, get)

    return
  }

  await hydrateFavouritesStore(set, get, signal)
}

async function syncGuestFavouritesIntoBackend(
  set: FavStoreSet,
  get: FavStoreGet,
): Promise<void> {
  set({ status: 'syncing' })

  try {
    const response = await syncFavourites({
      productIds: uniqueIds(get().favouriteIds),
    })

    set({
      ...mapProductsToFavourites(response.products),
      isSync: true,
      status: 'ready',
    })
  } catch {
    set({ status: 'error' })
  }
}
