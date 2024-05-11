import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { apiGetProductRating } from '@/services/ratingService'

interface ProductRatingStore {
  ratings: Record<string, { id: string; rating: number; quantity: number }>
  setRating: (productId: string, rating: number) => void
  getProductRating: (productId: string) => Promise<void>
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
              quantity: state.ratings[productId]?.quantity || 0,
            },
          },
        })),
      getProductRating: async (productId: string) => {
        const ratings = await apiGetProductRating(productId)

        set((state) => ({
          ratings: {
            ...state.ratings,
            [productId]: {
              id: productId,
              rating: ratings.length > 0 ? ratings[0].mark : 0,
              quantity: ratings.length > 0 ? ratings[0].quantity : 0,
            },
          },
        }))
      },
    }),
    {
      name: 'productRating',
    },
  ),
)
