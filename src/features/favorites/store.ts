import { create, StateCreator } from 'zustand'
import { persist } from 'zustand/middleware'
import { IProduct } from '@/features/products/types'
import { mergeFavs, removeFavItem, getFavByIds } from './api'
import { IFavPushItems } from './types'
import { getProductByIds } from '@/features/products/api'

export type FavStatus = 'idle' | 'syncing' | 'ready' | 'error'

interface FavSliceState {
  favouriteIds: string[]
  favourites: IProduct[]
  status: FavStatus
  pendingIds: Set<string>
}

interface FavSliceActions {
  toggleFavourite: (id: string, token: string | null) => Promise<void>
  getFavouriteProducts: (token: string | null) => Promise<void>
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

const setProducts = (products: IProduct[]) => {
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
  toggleFavourite: async (id, token) => {
    if (get().pendingIds.has(id)) return

    const wasAdded = !get().favouriteIds.includes(id)
    const prevIds = get().favouriteIds
    const prevFavs = get().favourites

    // optimistic update
    set((state) => {
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
      if (token) {
        if (wasAdded) {
          const reqItems: IFavPushItems = { productIds: [id] }
          const response = await mergeFavs(reqItems)

          set(setProducts(response.products))
        } else {
          await removeFavItem(id)
        }
      } else if (wasAdded) {
        const products = await getProductByIds(uniqueIds([...prevIds, id]))
        const safe: IProduct[] = Array.isArray(products) ? products : []

        set(setProducts(safe))
      }
    } catch {
      set({ favouriteIds: prevIds, favourites: prevFavs })
    } finally {
      set((state) => {
        const pending = new Set(state.pendingIds)

        pending.delete(id)

        return { pendingIds: pending }
      })
    }
  },
  getFavouriteProducts: async (token) => {
    set({ status: 'syncing' })
    try {
      if (token) {
        const products = await getFavByIds()

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
    const { favouriteIds } = get()
    const reqItems: IFavPushItems = { productIds: uniqueIds(favouriteIds) }
    const response = await mergeFavs(reqItems)

    set(setProducts(response.products))
  },
  resetFav: () => set({ favourites: [], favouriteIds: [], status: 'idle', pendingIds: new Set() }),
})

export const useFavouritesStore = create<FavStoreState>()(
  persist(createFavSlice, {
    name: 'fav-storage',
    partialize: (state) => ({ favouriteIds: state.favouriteIds }),
  }),
)
