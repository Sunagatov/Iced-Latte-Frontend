import { create, type StateCreator } from 'zustand'
import { persist } from 'zustand/middleware'
import { IProduct } from '@/features/products/types'
import { syncFavourites, removeFavourite, fetchFavourites } from './api'
import { SyncFavouritesRequest } from './types'
import { getProductByIds } from '@/features/products/api'
import { useAuthStore } from '@/features/auth/store'

export type FavStatus = 'idle' | 'syncing' | 'ready' | 'error'

interface FavSliceState {
  favouriteIds: string[]
  favourites: IProduct[]
  status: FavStatus
  pendingIds: Set<string>
}

interface FavSliceActions {
  toggleFavourite: (id: string) => Promise<void>
  getFavouriteProducts: () => Promise<void>
  syncBackendFav: () => Promise<void>
  resetFav: () => void
}

export type FavStoreState = FavSliceState & FavSliceActions

const initialState: FavSliceState = {
  favouriteIds: [],
  favourites: [],
  status: 'idle',
  pendingIds: new Set<string>(),
}

const uniqueIds = (ids: readonly string[]): string[] => Array.from(new Set(ids))

const isProduct = (value: unknown): value is IProduct => {
  if (typeof value !== 'object' || value === null) {
    return false
  }

  const candidate = value as Partial<IProduct>

  return typeof candidate.id === 'string'
}

const normalizeProducts = (products: unknown): IProduct[] => {
  if (!Array.isArray(products)) {
    return []
  }

  const seen = new Set<string>()
  const unique: IProduct[] = []

  for (const item of products) {
    if (!isProduct(item) || seen.has(item.id)) {
      continue
    }

    seen.add(item.id)
    unique.push(item)
  }

  return unique
}

const setProducts = (
  products: unknown,
): Pick<FavSliceState, 'favourites' | 'favouriteIds'> => {
  const unique = normalizeProducts(products)

  return {
    favourites: unique,
    favouriteIds: unique.map((product) => product.id),
  }
}

const createFavSlice: StateCreator<FavStoreState, [], [], FavStoreState> = (set, get) => ({
  ...initialState,

  toggleFavourite: async (id: string) => {
    const { pendingIds, favouriteIds, favourites } = get()

    if (pendingIds.has(id)) {
      return
    }

    const isAuthenticated = useAuthStore.getState().status === 'authenticated'
    const wasAdded = !favouriteIds.includes(id)
    const previousProduct = favourites.find((product) => product.id === id) ?? null

    set((state) => {
      const nextPendingIds = new Set(state.pendingIds)

      nextPendingIds.add(id)

      if (wasAdded) {
        return {
          pendingIds: nextPendingIds,
          favouriteIds: uniqueIds([...state.favouriteIds, id]),
        }
      }

      return {
        pendingIds: nextPendingIds,
        favouriteIds: state.favouriteIds.filter((favouriteId) => favouriteId !== id),
        favourites: state.favourites.filter((product) => product.id !== id),
      }
    })

    try {
      if (isAuthenticated) {
        if (wasAdded) {
          const request: SyncFavouritesRequest = { productIds: [id] }
          const response = await syncFavourites(request)

          set(setProducts(response.products))
        } else {
          const response = await removeFavourite(id)

          set(setProducts(response.products))
        }

        return
      }

      if (wasAdded) {
        const currentIds = get().favouriteIds
        const products = await getProductByIds(uniqueIds(currentIds))

        set(setProducts(products))
      }
    } catch {
      set((state) => {
        if (wasAdded) {
          return {
            favouriteIds: state.favouriteIds.filter((favouriteId) => favouriteId !== id),
            favourites: state.favourites.filter((product) => product.id !== id),
          }
        }

        const restoredIds = uniqueIds([...state.favouriteIds, id])
        const restoredFavourites = previousProduct
          ? setProducts([...state.favourites, previousProduct]).favourites
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

  getFavouriteProducts: async () => {
    const isAuthenticated = useAuthStore.getState().status === 'authenticated'

    set({ status: 'syncing' })

    try {
      if (isAuthenticated) {
        const products = await fetchFavourites()

        set({ ...setProducts(products), status: 'ready' })

        return
      }

      const productIds = get().favouriteIds

      if (productIds.length === 0) {
        set({ favourites: [], favouriteIds: [], status: 'ready' })

        return
      }

      const products = await getProductByIds(productIds)

      set({ ...setProducts(products), status: 'ready' })
    } catch {
      set({ status: 'error' })
    }
  },

  syncBackendFav: async () => {
    set({ status: 'syncing' })

    try {
      const { favouriteIds } = get()
      const request: SyncFavouritesRequest = { productIds: uniqueIds(favouriteIds) }
      const response = await syncFavourites(request)

      set({ ...setProducts(response.products), status: 'ready' })
    } catch {
      set({ status: 'error' })
    }
  },

  resetFav: () =>
    set({
      favourites: [],
      favouriteIds: [],
      status: 'idle',
      pendingIds: new Set<string>(),
    }),
})

export const useFavouritesStore = create<FavStoreState>()(
  persist<FavStoreState>(createFavSlice, {
    name: 'fav-storage',
    partialize: (state): Pick<FavSliceState, 'favouriteIds'> => ({
      favouriteIds: state.favouriteIds,
    }),
  }),
)