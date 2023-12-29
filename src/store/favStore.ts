import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { IProduct } from '@/models/Products'
import { getFavByIds, mergeFavs, removeFavItem } from '@/services/apiFavService'
import { getProductByIds } from '@/services/apiService'
import { IFavPushItems } from '@/models/FAv'

export interface FavSliceState {
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

      addFavourite: async (id: string, token: string | null): Promise<void> => {
        const { favouriteIds } = get()

        if (token) {
          await get().syncBackendFav(token)
        } else {
          set({ favouriteIds: [...favouriteIds, id] })
        }
      },

      removeFavourite: async (
        id: string,
        token: string | null,
      ): Promise<void> => {
        try {
          if (token) {
            await removeFavItem(token, id)
            await get().syncBackendFav(token)
          } else {
            set((state) => ({
              favouriteIds: state.favouriteIds.filter((favId) => favId !== id),
              favourites: state.favourites.filter((fav) => fav.id !== id),
            }))
          }
        } catch (error) {
          throw new Error((error as Error).message)
        }
      },
      getFavouriteProducts: async (token: string | null): Promise<void> => {
        try {
          if (token) {
            const products = await getFavByIds(token)

            set((state) => ({
              ...state,
              favourites: products,
              count: products.length,
            }))
          } else {
            const productIds = get().favouriteIds
            const products = await getProductByIds(productIds)

            set((state) => ({
              ...state,
              favourites: products,
              count: productIds.length,
            }))
          }
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
