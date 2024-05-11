import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { Review } from '@/types/ReviewType'
import { IProductReviewsStatistics } from '@/types/IProductReviewsStatistics'

interface ReviewsStoreState {
  currentPage: number
  totalElements: number
  isReviewFormVisible: boolean
  isReviewButtonVisible: boolean
  isReviewRatingFormVisible: boolean
  setIsReviewFormVisible: (isVisible: boolean) => void
  setIsReviewButtonVisible: (isVisible: boolean) => void
  setIsRaitingFormVisible: (isVisible: boolean) => void
  setTotalReviewsCount: (value: number) => void
  setShouldRevalidateStatistics: (value: boolean) => void
  shouldRevalidateStatistics: boolean
  setShouldRevalidateReviews: (value: boolean) => void
  shouldRevalidateReviews: boolean
  setShouldRevalidateUserReview: (value: boolean) => void
  shouldRevalidateUserReview: boolean
  reviewsStatistics: IProductReviewsStatistics | null
  setReviewsStatistics: (value: IProductReviewsStatistics | null) => void
  reviewFormRating: number
  setReviewFormRating: (value: number) => void
}

export const checkIfUserReviewExists = (review: Review | null): boolean => {
  return !!review && !Object.values(review).every((prop) => prop === null)
}

export const useProductReviewsStore = create<ReviewsStoreState>()(
  persist(
    (set) => ({
      currentPage: 0,
      totalElements: 0,
      totalPages: 0,
      shouldRevalidateStatistics: true,
      reviewsStatistics: null,
      reviewFormRating: 0,
      shouldRevalidateReviews: false,
      shouldRevalidateUserReview: true,

      isReviewFormVisible: false,
      isReviewButtonVisible: true, // ? false
      isReviewRatingFormVisible: false,

      setIsReviewFormVisible: (isVisible: boolean) =>
        set({ isReviewFormVisible: isVisible }),
      setIsReviewButtonVisible: (isVisible: boolean) =>
        set({ isReviewButtonVisible: isVisible }),
      setIsRaitingFormVisible: (isVisible: boolean) =>
        set({ isReviewRatingFormVisible: isVisible }),
      setwasRend: () => {
        set((state) => ({
          ...state,
          wasRend: true,
        }))
      },
      setTotalReviewsCount: (value: number) => {
        set((state) => ({
          ...state,
          totalElements: value,
        }))
      },
      setShouldRevalidateStatistics: (value: boolean) => {
        set((state) => ({
          ...state,
          shouldRevalidateStatistics: value,
        }))
      },
      setReviewsStatistics: (value: IProductReviewsStatistics | null) => {
        set((state) => ({
          ...state,
          reviewsStatistics: value,
        }))
      },
      setReviewFormRating: (value: number) => {
        set((state) => ({
          ...state,
          reviewFormRating: value,
        }))
      },
      setShouldRevalidateReviews: (value: boolean) => {
        set((state) => ({
          ...state,
          shouldRevalidateReviews: value,
        }))
      },
      setShouldRevalidateUserReview: (value: boolean) => {
        set((state) => ({
          ...state,
          shouldRevalidateUserReview: value,
        }))
      },
    }),
    {
      name: 'productReviews',
    },
  ),
)
