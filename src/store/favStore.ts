import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { IProduct } from '@/models/Products'

export interface FavSliceState {
  favouriteIds: string[]
  favourites: IProduct[]
  loading: boolean
  count: number
  isClicked: boolean
}

interface FavSliceActions {
  addFavourite: (id: string) => void
  removeFavourite: (id: string) => void
  getFavouriteProducts: () => Promise<void>
  setLoading: (loading: boolean) => void
}

export type FavStoreState = FavSliceState & FavSliceActions

const initialState: FavSliceState = {
  favouriteIds: [],
  favourites: [],
  count: 0,
  loading: false,
  isClicked: false,
}

const fetchProductsByIds = async (ids: string[]): Promise<IProduct[]> => {
  if (ids.length === 0) return []

  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_HOST_REMOTE}/products/ids`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ productIds: ids }),
      },
    )

    if (!response.ok) {
      throw new Error('One or more products not found')
    }

    const favourites: IProduct[] = await response.json()

    return favourites || []
  } catch (error) {
    console.error('Error fetching products:', error)

    return []
  }
}

export const useFavouritesStore = create<FavStoreState>()(
  persist(
    (set, get) => ({
      ...initialState,
      setLoading: (loading) => set({ loading }),

      addFavourite: (id) =>
        set((state) => ({
          favouriteIds: [...state.favouriteIds, id],
        })),

      removeFavourite: (id) => {
        set((state) => ({
          favouriteIds: state.favouriteIds.filter((favId) => favId !== id),
          favourites: state.favourites.filter((fav) => fav.id !== id),
        }))
      },

      getFavouriteProducts: async (): Promise<void> => {
        const productIds = get().favouriteIds

        try {
          const products = await fetchProductsByIds(productIds)

          set((state) => ({
            ...state,
            favourites: products,
            count: productIds.length,
          }))
        } catch (error) {
          throw new Error((error as Error).message)
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
