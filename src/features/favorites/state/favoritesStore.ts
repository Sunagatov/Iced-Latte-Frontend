import { create, type StateCreator } from 'zustand'
import { persist } from 'zustand/middleware'
import { getProductByIds, type IProduct } from '@/features/products/public'
import {
  fetchFavourites,
  removeFavourite,
  syncFavourites,
} from '@/features/favorites/api/favoritesApi'
import type { SyncFavouritesRequest } from '@/features/favorites/types/favoritesTypes'
import { useAuthStore } from '@/features/auth/store'
import {
  mapProductsToFavourites,
  normalizeProducts,
  uniqueIds,
} from '@/features/favorites/state/favoritesStore.utils'

export type FavStatus = 'idle' | 'syncing' | 'ready' | 'error'

interface FavSliceState {
  favouriteIds: string[]
  favourites: IProduct[]
  status: FavStatus
  pendingIds: Set<string>
  isSync: boolean
}

interface FavSliceActions {
  getFavouriteProducts: (signal?: AbortSignal) => Promise<void>
  resetFav: () => void
  syncBackendFav: () => Promise<void>
  toggleFavourite: (id: string) => Promise<void>
}

export type FavStoreState = FavSliceState & FavSliceActions

const initialState: FavSliceState = {
  favouriteIds: [],
  favourites: [],
  status: 'idle',
  pendingIds: new Set<string>(),
  isSync: false,
}

const createFavSlice: StateCreator<FavStoreState, [], [], FavStoreState> = (
  set,
  get,
) => ({
  ...initialState,

  toggleFavourite: async (id: string) => {
    const { pendingIds, favouriteIds, favourites } = get()

    if (pendingIds.has(id)) {
      return
    }

    const isAuthenticated = useAuthStore.getState().status === 'authenticated'
    const wasAdded = !favouriteIds.includes(id)
    const previousProduct =
      favourites.find((product) => product.id === id) ?? null

    set((state) => {
      const nextPendingIds = new Set(state.pendingIds)

      nextPendingIds.add(id)

      if (wasAdded) {
        return {
          favouriteIds: uniqueIds([...state.favouriteIds, id]),
          pendingIds: nextPendingIds,
        }
      }

      return {
        favouriteIds: state.favouriteIds.filter(
          (favouriteId) => favouriteId !== id,
        ),
        favourites: state.favourites.filter((product) => product.id !== id),
        pendingIds: nextPendingIds,
      }
    })

    try {
      if (isAuthenticated) {
        if (wasAdded) {
          const request: SyncFavouritesRequest = { productIds: [id] }
          const response = await syncFavourites(request)

          set(mapProductsToFavourites(response.products))
        } else {
          await removeFavourite(id)
        }

        return
      }

      if (wasAdded) {
        const currentIds = get().favouriteIds
        const products = await getProductByIds(uniqueIds(currentIds))

        set(mapProductsToFavourites(products))
      }
    } catch {
      set((state) => {
        if (wasAdded) {
          return {
            favouriteIds: state.favouriteIds.filter(
              (favouriteId) => favouriteId !== id,
            ),
            favourites: state.favourites.filter((product) => product.id !== id),
          }
        }

        const restoredIds = uniqueIds([...state.favouriteIds, id])
        const restoredFavourites = previousProduct
          ? mapProductsToFavourites([...state.favourites, previousProduct])
            .favourites
          : state.favourites

        return {
          favouriteIds: restoredIds,
          favourites: restoredFavourites,
        }
      })
    } finally {
      set((state) => {
        const nextPendingIds = new Set(state.pendingIds)

        nextPendingIds.delete(id)

        return { pendingIds: nextPendingIds }
      })
    }
  },

  getFavouriteProducts: async (signal?: AbortSignal) => {
    const isAuthenticated = useAuthStore.getState().status === 'authenticated'

    set({ status: 'syncing' })

    try {
      if (isAuthenticated) {
        const products = await fetchFavourites(signal)

        if (signal?.aborted) {
          return
        }

        const incoming = normalizeProducts(products)
        const currentIds = get().favouriteIds

        if (incoming.length === 0 && currentIds.length > 0 && !get().isSync) {
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

      const productIds = get().favouriteIds

      if (productIds.length === 0) {
        set({ favouriteIds: [], favourites: [], status: 'ready' })

        return
      }

      const products = await getProductByIds(productIds)

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
  },

  syncBackendFav: async () => {
    set({ status: 'syncing' })

    try {
      const { favouriteIds } = get()
      const request: SyncFavouritesRequest = {
        productIds: uniqueIds(favouriteIds),
      }
      const response = await syncFavourites(request)

      set({
        ...mapProductsToFavourites(response.products),
        isSync: true,
        status: 'ready',
      })
    } catch {
      set({ status: 'error' })
    }
  },

  resetFav: () =>
    set({
      favouriteIds: [],
      favourites: [],
      isSync: false,
      pendingIds: new Set<string>(),
      status: 'idle',
    }),
})

export const useFavouritesStore = create<FavStoreState>()(
  persist<FavStoreState, [], [], Pick<FavSliceState, 'favouriteIds' | 'isSync'>>(
    createFavSlice,
    {
      name: 'fav-storage',
      partialize: (state): Pick<FavSliceState, 'favouriteIds' | 'isSync'> => ({
        favouriteIds: state.favouriteIds,
        isSync: state.isSync,
      }),
    },
  ),
)
