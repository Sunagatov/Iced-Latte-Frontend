import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { apiGetProductReviews, Review } from '@/services/reviewService'

interface ReviewsStoreState {
  reviewsWithRatings: Review[]
  getProductReviews: (productId: string) => Promise<void>
}

export const useProductReviewsStore = create<ReviewsStoreState>()(
  persist(
    (set) => ({
      reviewsWithRatings: [],
      getProductReviews: async (productId: string) => {
        const reviews = await apiGetProductReviews(productId)

        set((state) => ({
          ...state,
          reviewsWithRatings: reviews.reviewsWithRatings || [],
        }))
      },
    }),
    {
      name: 'productReviews',
    }
  ),
)