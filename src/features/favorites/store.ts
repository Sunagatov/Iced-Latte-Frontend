import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { IProduct } from '@/features/products/types'
import { mergeFavs, removeFavItem, getFavByIds } from './api'
import { IFavPushItems } from './types'
import { getProductByIds } from '@/features/products/api'

interface FavSliceState {
  favouriteIds: string[]
  favourites: IProduct[]
  loading: boolean
  count: number
  isSync: false
}

interface FavSliceActions {
  addFavourite: (id: string, token: string | null) => Promise<void>
  removeFavourite: (id: string, token: string | null) => Promise<void>
  getFavouriteProducts: (token: string | null) => Promise<void>
  setLoading: (loading: boolean) => void
  syncBackendFav: () => Promise<void>
  resetFav: () => void
}

export type FavStoreState = FavSliceState & FavSliceActions

const initialState: FavSliceState = {
  favouriteIds: [],
  favourites: [],
  count: 0,
  loading: false,
  isSync: false,
}

export const useFavouritesStore = create<FavStoreState>()(
  persist(
    (set, get) => ({
      ...initialState,
      setLoading: (loading) => set({ loading }),
      addFavourite: async (id, token) => {
        const updatedIds = [...get().favouriteIds, id]

        set({ favouriteIds: updatedIds })
        if (token) {
          try {
            const reqItems: IFavPushItems = { productIds: [id] }
            const response = await mergeFavs(reqItems)
            const ids = response.products.map((p) => p.id)

            set({ favourites: response.products, favouriteIds: ids, count: ids.length })
          } catch {
            set((state) => ({ favouriteIds: state.favouriteIds.filter((fid) => fid !== id) }))
          }
        } else {
          const products = await getProductByIds(updatedIds)
          const safeProducts = Array.isArray(products) ? products : []

          set({ favourites: safeProducts, count: updatedIds.length })
        }
      },
      removeFavourite: async (id, token) => {
        set((state) => ({
          favouriteIds: state.favouriteIds.filter((favId) => favId !== id),
          favourites: state.favourites.filter((fav) => fav.id !== id),
          count: Math.max(0, state.count - 1),
        }))
        if (token) {
          try {
            await removeFavItem(id)
          } catch { /* best-effort */ }
        }
      },
      getFavouriteProducts: async (token) => {
        if (token) {
          const favouritesFromServer = await getFavByIds()
          const ids = favouritesFromServer.map((p) => p.id)

          set((state) => ({ ...state, favourites: favouritesFromServer, favouriteIds: ids, count: favouritesFromServer.length }))
        } else {
          const productIds = get().favouriteIds
          const products = await getProductByIds(productIds)
          const safeProducts = Array.isArray(products) ? products : []

          set((state) => ({ ...state, favourites: safeProducts, count: productIds.length }))
        }
      },
      syncBackendFav: async () => {
        const { favouriteIds } = get()
        const reqItems: IFavPushItems = { productIds: favouriteIds }
        const response = await mergeFavs(reqItems)
        const ids = response.products.map((p) => p.id)

        set((state) => ({ ...state, favourites: response.products, favouriteIds: ids, count: ids.length }))
      },
      resetFav: () => set({ favourites: [], favouriteIds: [], count: 0, loading: false }),
    }),
    {
      name: 'fav-storage',
      partialize: (state) => ({ favouriteIds: state.favouriteIds, favourites: state.favourites }),
    },
  ),
)
