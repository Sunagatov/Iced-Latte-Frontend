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
  getFavouriteProducts: () => Promise<IProduct[]>
  setLoading: (loading: boolean) => void
  setClicked: (clicked: boolean) => void
}

export type FavStoreState = FavSliceState & FavSliceActions

const initialState: FavSliceState = {
  favouriteIds: [
    '123f7a2d-cb34-4e5f-9a1d-4e4b456a03a7',
    '1e5b295f-8f50-4425-90e9-8b590a27b3a9',
    'eedc6cde-1e80-4ebf-a9d1-8e5e4eb2cacf',
  ],
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

      removeFavourite: (id) =>
        set((state) => ({
          favouriteIds: state.favouriteIds.filter((favId) => favId !== id),
          favourites: state.favourites.filter((fav) => fav.id !== id),
        })),

      getFavouriteProducts: async (): Promise<IProduct[]> => {
        const productIds = get().favouriteIds

        console.log('Initial State:', get())

        try {
          const products = await fetchProductsByIds(productIds)

          // Checking the state
          set((state) => ({
            ...state,
            favourites: products,
            count: productIds.length,
          }))

          console.log('state', {
            ...get(),
            favourites: products,
            count: productIds.length,
          })

          return products
        } catch (error) {
          console.error('Error fetching favorite products:', error)

          return []
        }
      },
      setClicked: (clicked) => set({ isClicked: clicked }),
    }),
    {
      name: 'fav-storage',
      partialize: (state) => ({
        favouriteIds: state.favouriteIds,
      }),
    },
  ),
)
