import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { IProduct } from '@/models/Products'

export interface FavStoreState {
  favouriteIds: string[]
  addFavourite: (id: string) => void
  removeFavourite: (id: string) => void
  getFavouriteProducts: () => Promise<IProduct[]>
  favourites: IProduct[]
  count: number
}

const fetchProductsByIds = async (
  ids: string[],
): Promise<IProduct[] | null> => {
  try {
    const responses = await Promise.all(
      ids.map((id) =>
        fetch(`${process.env.NEXT_PUBLIC_API_HOST_REMOTE}/products/${id}`),
      ),
    )

    if (!responses.every((response) => response.ok)) {
      throw new Error('One or more products not found')
    }

    const favProducts: IProduct[] = await Promise.all(
      responses.map((response) => response.json()),
    )

    return favProducts
  } catch (error) {
    console.error('Fetching products failed:', error)

    return null
  }
}

export const useFavouritesStore = create<FavStoreState>()(
  persist(
    (set, get) => ({
      favouriteIds: [],
      addFavourite: (id) =>
        set((state) => ({
          favouriteIds: [...state.favouriteIds, id],
        })),
      removeFavourite: (id) =>
        set((state) => ({
          favouriteIds: state.favouriteIds.filter((favId) => favId !== id),
        })),
      getFavouriteProducts: async (): Promise<IProduct[]> => {
        const favouriteProductsPromises = get().favouriteIds.map((id) =>
          fetchProductsByIds([id]),
        )

        const favouriteProductsResults = await Promise.all(
          favouriteProductsPromises,
        )

        const flattenedResults = favouriteProductsResults.flat()

        return flattenedResults.filter(
          (product): product is IProduct => product !== null,
        )
      },
      favourites: [],
    }),
    {
      name: 'favourites-storage',
      partialize: (state) => ({
        favouriteIds: state.favouriteIds,
        count: state.count,
      }),
    },
  ),
)
