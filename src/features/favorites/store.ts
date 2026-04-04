import { create, StateCreator } from 'zustand'
import { persist } from 'zustand/middleware'
import { IProduct } from '@/features/products/types'
import { syncFavourites, removeFavourite, fetchFavourites } from './api'
import { SyncFavouritesRequest } from './types'
import { getProductByIds } from '@/features/products/api'
import { useAuthStore, AuthStore } from '@/features/auth/store'

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
  pendingIds: new Set(),
}

const uniqueIds = (ids: string[]): string[] => Array.from(new Set(ids))

const setProducts = (products: IProduct[]): Pick<FavSliceState, 'favourites' | 'favouriteIds'> => {
  const seen = new Set<string>()
  const unique = products.filter((p) => {
    if (seen.has(p.id)) return false

    seen.add(p.id)

    return true
  })

  return { favourites: unique, favouriteIds: unique.map((p) => p.id) }
}

const createFavSlice: StateCreator<FavStoreState> = (set, get) => ({
  ...initialState,
  toggleFavourite: async (id) => {
    if (get().pendingIds.has(id)) return

    const isAuthenticated = (useAuthStore.getState() as AuthStore).status === 'authenticated'
    const wasAdded = !get().favouriteIds.includes(id)
    const previousProduct: IProduct | null = get().favourites.find((p) => p.id === id) ?? null

    // optimistic update
    set((state: FavStoreState) => {
      const pending = new Set(state.pendingIds)

      pending.add(id)
      if (wasAdded) {
        return { pendingIds: pending, favouriteIds: uniqueIds([...state.favouriteIds, id]) }
      }

      return {
        pendingIds: pending,
        favouriteIds: state.favouriteIds.filter((fid) => fid !== id),
        favourites: state.favourites.filter((f) => f.id !== id),
      }
    })

    try {
      if (isAuthenticated) {
        if (wasAdded) {
          const reqItems: SyncFavouritesRequest = { productIds: [id] }
          const response = await syncFavourites(reqItems)

          set(setProducts(response.products))
        } else {
          const response = await removeFavourite(id)

          set(setProducts(response.products))
        }
      } else if (wasAdded) {
        const currentIds: string[] = get().favouriteIds
        const products: IProduct[] = await getProductByIds(uniqueIds([...currentIds]))
        const safe: IProduct[] = Array.isArray(products) ? products : []

        set(setProducts(safe))
      }
    } catch {
      // item-scoped rollback — only revert the affected product
      set((state: FavStoreState) => {
        if (wasAdded) {
          return {
            favouriteIds: state.favouriteIds.filter((fid) => fid !== id),
            favourites: state.favourites.filter((p) => p.id !== id),
          }
        }

        const restoredIds = uniqueIds([...state.favouriteIds, id])
        const restoredFavs = previousProduct
          ? setProducts([...state.favourites, previousProduct]).favourites
          : state.favourites

        return { favouriteIds: restoredIds, favourites: restoredFavs }
      })
    } finally {
      set((state: FavStoreState) => {
        const pending = new Set(state.pendingIds)

        pending.delete(id)

        return { pendingIds: pending }
      })
    }
  },
  getFavouriteProducts: async () => {
    const isAuthenticated = (useAuthStore.getState() as AuthStore).status === 'authenticated'

    set({ status: 'syncing' })
    try {
      if (isAuthenticated) {
        const products = await fetchFavourites()

        set({ ...setProducts(products), status: 'ready' })
      } else {
        const productIds = get().favouriteIds
        const products = await getProductByIds(productIds)
        const safe: IProduct[] = Array.isArray(products) ? products : []

        set({ ...setProducts(safe), status: 'ready' })
      }
    } catch {
      set({ status: 'error' })
    }
  },
  syncBackendFav: async () => {
    set({ status: 'syncing' })
    try {
      const { favouriteIds } = get()
      const reqItems: SyncFavouritesRequest = { productIds: uniqueIds(favouriteIds) }
      const response = await syncFavourites(reqItems)

      set({ ...setProducts(response.products), status: 'ready' })
    } catch {
      set({ status: 'error' })
    }
  },
  resetFav: () => set({ favourites: [], favouriteIds: [], status: 'idle', pendingIds: new Set() }),
})

export const useFavouritesStore = create<FavStoreState>()(
  persist(createFavSlice, {
    name: 'fav-storage',
    partialize: (state) => ({ favouriteIds: state.favouriteIds }),
  }),
)
