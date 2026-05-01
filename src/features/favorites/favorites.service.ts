import { useAuthStore } from '@/features/auth/store'
import {
  fetchFavourites,
  removeFavourite,
  syncFavourites,
} from '@/features/favorites/api/favoritesApi'
import {
  mapProductsToFavourites,
  normalizeProducts,
  uniqueIds,
} from '@/features/favorites/state/favoritesStore.utils'
import { getProductByIds, type IProduct } from '@/features/products/public'

type FavStatus = 'idle' | 'syncing' | 'ready' | 'error'

type FavState = {
  favouriteIds: string[]
  favourites: IProduct[]
  isSync: boolean
  pendingIds: Set<string>
  status: FavStatus
}

type FavSet = {
  (partial: Partial<FavState>): void
  (fn: (state: FavState) => Partial<FavState>): void
}

type FavGet = () => FavState

export async function toggleFavouriteInStore(
  set: FavSet,
  get: FavGet,
  productId: string,
): Promise<void> {
  const { pendingIds, favouriteIds, favourites } = get()

  if (pendingIds.has(productId)) {
    return
  }

  const isAuthenticated = useAuthStore.getState().status === 'authenticated'
  const wasAdded = !favouriteIds.includes(productId)
  const previousProduct = favourites.find((product) => product.id === productId) ?? null

  set((state) => {
    const nextPendingIds = new Set(state.pendingIds)

    nextPendingIds.add(productId)

    if (wasAdded) {
      return {
        favouriteIds: uniqueIds([...state.favouriteIds, productId]),
        pendingIds: nextPendingIds,
      }
    }

    return {
      favouriteIds: state.favouriteIds.filter((id) => id !== productId),
      favourites: state.favourites.filter((product) => product.id !== productId),
      pendingIds: nextPendingIds,
    }
  })

  try {
    if (isAuthenticated) {
      if (wasAdded) {
        const response = await syncFavourites({ productIds: [productId] })

        set(mapProductsToFavourites(response.products))
      } else {
        await removeFavourite(productId)
      }

      return
    }

    if (wasAdded) {
      const products = await getProductByIds(uniqueIds(get().favouriteIds))

      set(mapProductsToFavourites(products))
    }
  } catch {
    set((state) => {
      if (wasAdded) {
        return {
          favouriteIds: state.favouriteIds.filter((id) => id !== productId),
          favourites: state.favourites.filter((product) => product.id !== productId),
        }
      }

      return {
        favouriteIds: uniqueIds([...state.favouriteIds, productId]),
        favourites: previousProduct
          ? mapProductsToFavourites([...state.favourites, previousProduct]).favourites
          : state.favourites,
      }
    })
  } finally {
    set((state) => {
      const nextPendingIds = new Set(state.pendingIds)

      nextPendingIds.delete(productId)

      return { pendingIds: nextPendingIds }
    })
  }
}

export async function hydrateFavouritesStore(
  set: FavSet,
  get: FavGet,
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
    if (
      (err as { name?: string }).name === 'AbortError' ||
      (err as { name?: string }).name === 'CanceledError'
    ) {
      return
    }

    set({ status: 'error' })
  }
}

export async function syncFavouritesStoreWithSession(
  set: FavSet,
  get: FavGet,
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

async function syncGuestFavouritesIntoBackend(set: FavSet, get: FavGet): Promise<void> {
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
