import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { IProduct } from '@/types/Products'
import { mergeFavs, removeFavItem, getFavByIds } from '@/services/apiFavService'
import { IFavPushItems } from '@/types/Fav'
import { getProductByIds } from '@/services/apiService'

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

      addFavourite: async (id: string, token: string | null): Promise<void> => {
        const { favouriteIds } = get()

        if (token) {
          set({
            favouriteIds: [...favouriteIds, id],
          })
          await get().syncBackendFav()
        } else {
          set({
            favouriteIds: [...favouriteIds, id],
          })
        }
      },

      removeFavourite: async (
        id: string,
        token: string | null,
      ): Promise<void> => {
        try {
          if (token) {
            set((state) => ({
              ...state,
              favouriteIds: state.favouriteIds.filter((favId) => favId !== id),
              favourites: state.favourites.filter((fav) => fav.id !== id),
            }))
            await removeFavItem(id)
          } else {
            set((state) => ({
              ...state,
              favouriteIds: state.favouriteIds.filter((favId) => favId !== id),
              favourites: state.favourites.filter((fav) => fav.id !== id),
            }))
          }
        } catch (error) {
          throw new Error((error as Error).message)
        }
      },
      getFavouriteProducts: async (token): Promise<void> => {
        try {
          if (token) {
            const favouritesFromServer = await getFavByIds()

            set((state) => ({
              ...state,
              favourites: favouritesFromServer,
              count: favouritesFromServer.length,
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

      syncBackendFav: async () => {
        try {
          const { favouriteIds } = get()
          const reqItems: IFavPushItems = { productIds: favouriteIds }

          const response = await mergeFavs(reqItems)
          const { products } = response

          set((state) => ({
            ...state,
            favourites: products,
          }))
        } catch (e) {
          throw new Error((e as Error).message)
        }
      },
      resetFav: () => set({ favourites: [], favouriteIds: [], count: 0 }),
    }),
    {
      name: 'fav-storage',
      partialize: (state) => ({
        favouriteIds: state.favouriteIds,
        favourites: state.favourites,
      }),
    },
  ),
)
