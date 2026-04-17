import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { Review } from './types'

export const checkIfUserReviewExists = (review: Review | null): boolean => {
  return !!review && !Object.values(review).every((prop) => prop === null)
}

interface ProductRatingStore {
  ratings: Record<string, { id: string; rating: number }>
  setRating: (productId: string, rating: number) => void
}

export const useProductRatingStore = create<ProductRatingStore>()(
  persist(
    (set) => ({
      ratings: {},
      setRating: (productId, rating) =>
        set((state) => ({
          ratings: { ...state.ratings, [productId]: { id: productId, rating } },
        })),
    }),
    { name: 'productRating' },
  ),
)
