import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { IProduct } from '@/models/Products'
import { mergeFavs } from '@/services/apiFavService'
import { getProductByIds } from '@/services/apiService'

export interface FavSliceState {
  favouriteIds: string[]
  favourites: IProduct[]
  loading: boolean
  count: number
  isSync: false
}
interface IFavPushItems {
  favouriteIds: string[]
}
interface FavSliceActions {
  addFavourite: (id: string) => void
  removeFavourite: (id: string) => void
  getFavouriteProducts: () => Promise<void>
  setLoading: (loading: boolean) => void
  syncBackendFav: (token: string) => Promise<void>
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

      addFavourite: async (id: string, token: string | null) => {
        const { favouriteIds } = get()

        if (token) {
          await get().syncBackendFav(token)
        } else {
          set({ favouriteIds: [...favouriteIds, id] })
        }
      },

      removeFavourite: (id) => {
        set((state) => ({
          favouriteIds: state.favouriteIds.filter((favId) => favId !== id),
          favourites: state.favourites.filter((fav) => fav.id !== id),
        }))
      },
      getFavouriteProducts: async (): Promise<void> => {
        const productIds = get().favouriteIds

        try {
          const products = await getProductByIds(productIds)

          set((state) => ({
            ...state,
            favourites: products,
            count: productIds.length,
          }))
        } catch (error) {
          throw new Error((error as Error).message)
        }
      },
      syncBackendFav: async (token: string) => {
        try {
          const { favouriteIds } = get()
          const reqItems: IFavPushItems = { favouriteIds }

          const response = await mergeFavs(token, reqItems)
          const { products } = response

          set((state) => ({
            ...state,
            favourites: products,
          }))
        } catch (e) {
          throw new Error((e as Error).message)
        }
      },
    }),
    {
      name: 'fav-storage',
      partialize: (state) => ({
        favouriteIds: state.favouriteIds,
      }),
    },
  ),
)
