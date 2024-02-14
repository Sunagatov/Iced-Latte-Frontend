import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface ProductRatingStore {
  ratings: Record<string, { id: string; rating: number }>
  setRating: (productId: string, rating: number) => void
}

export const useProductRatingStore = create<ProductRatingStore>()(
  persist(
    (set) => ({
      ratings: {},
      setRating: (productId: string, rating: number) =>
        set((state) => ({
          ratings: {
            ...state.ratings,
            [productId]: {
              id: productId,
              rating: rating,
            },
          },
        })),
    }),
    {
      name: 'productRating',
    },
  ),
)
