import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import {
  apiGetProductReviews,
  apiGetProductUserReview,
} from '@/services/reviewService'
import { Review } from '@/types/ReviewType'

interface ReviewsStoreState {
  reviewsWithRatings: Review[]
  userReview: Review | null
  isReviewFormVisible: boolean
  isReviewButtonVisible: boolean
  isReviewRatingFormVisible: boolean
  setIsReviewFormVisible: (isVisible: boolean) => void
  setIsReviewButtonVisible: (isVisible: boolean) => void
  setIsRaitingFormVisible: (isVisible: boolean) => void
  getProductReviews: (productId: string) => Promise<void>
  getProductUserReview: (productId: string) => Promise<void>
}

export const useProductReviewsStore = create<ReviewsStoreState>()(
  persist(
    (set) => ({
      reviewsWithRatings: [],
      userReview: null,
      isReviewFormVisible: false,
      isReviewButtonVisible: true,
      isReviewRatingFormVisible: false,

      setIsReviewFormVisible: (isVisible: boolean) =>
        set({ isReviewFormVisible: isVisible }),
      setIsReviewButtonVisible: (isVisible: boolean) =>
        set({ isReviewButtonVisible: isVisible }),
      setIsRaitingFormVisible: (isVisible: boolean) =>
        set({ isReviewRatingFormVisible: isVisible }),

      getProductReviews: async (productId: string) => {
        const reviews = await apiGetProductReviews(productId)

        set((state) => ({
          ...state,
          reviewsWithRatings: reviews.reviewsWithRatings || [],
        }))
      },
      getProductUserReview: async (productId: string) => {
        const userReview = await apiGetProductUserReview(productId)

        set((state) => ({
          ...state,
          userReview,
        }))
      },
    }),
    {
      name: 'productReviews',
    },
  ),
)
