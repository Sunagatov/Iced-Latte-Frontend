import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { Review, IProductReviewsStatistics } from './types'

export const checkIfUserReviewExists = (review: Review | null): boolean => {
  return !!review && !Object.values(review).every((prop) => prop === null)
}

interface ReviewsStoreState {
  currentPage: number
  totalElements: number
  isReviewFormVisible: boolean
  isReviewButtonVisible: boolean
  isReviewRatingFormVisible: boolean
  shouldRevalidateStatistics: boolean
  shouldRevalidateReviews: boolean
  shouldRevalidateUserReview: boolean
  reviewsStatistics: IProductReviewsStatistics | null
  reviewFormRating: number
  setIsReviewFormVisible: (isVisible: boolean) => void
  setIsReviewButtonVisible: (isVisible: boolean) => void
  setIsRaitingFormVisible: (isVisible: boolean) => void
  setTotalReviewsCount: (value: number) => void
  setShouldRevalidateStatistics: (value: boolean) => void
  setShouldRevalidateReviews: (value: boolean) => void
  setShouldRevalidateUserReview: (value: boolean) => void
  setReviewsStatistics: (value: IProductReviewsStatistics | null) => void
  setReviewFormRating: (value: number) => void
}

export const useProductReviewsStore = create<ReviewsStoreState>()((set) => ({
  currentPage: 0,
  totalElements: 0,
  shouldRevalidateStatistics: true,
  reviewsStatistics: null,
  reviewFormRating: 0,
  shouldRevalidateReviews: false,
  shouldRevalidateUserReview: true,
  isReviewFormVisible: false,
  isReviewButtonVisible: true,
  isReviewRatingFormVisible: false,
  setIsReviewFormVisible: (isVisible) => set({ isReviewFormVisible: isVisible }),
  setIsReviewButtonVisible: (isVisible) => set({ isReviewButtonVisible: isVisible }),
  setIsRaitingFormVisible: (isVisible) => set({ isReviewRatingFormVisible: isVisible }),
  setTotalReviewsCount: (value) => set({ totalElements: value }),
  setShouldRevalidateStatistics: (value) => set({ shouldRevalidateStatistics: value }),
  setReviewsStatistics: (value) => set({ reviewsStatistics: value }),
  setReviewFormRating: (value) => set({ reviewFormRating: value }),
  setShouldRevalidateReviews: (value) => set({ shouldRevalidateReviews: value }),
  setShouldRevalidateUserReview: (value) => set({ shouldRevalidateUserReview: value }),
}))

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
