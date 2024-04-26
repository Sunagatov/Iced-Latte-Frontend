import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { Review } from '@/types/ReviewType'
import {IProductReviewsStatistics} from "@/types/IProductReviewsStatistics";

interface ReviewsStoreState {
  currentPage: number
  totalElements: number
  isReviewFormVisible: boolean
  isReviewButtonVisible: boolean
  isReviewRatingFormVisible: boolean
  setIsReviewFormVisible: (isVisible: boolean) => void
  setIsReviewButtonVisible: (isVisible: boolean) => void
  setIsRaitingFormVisible: (isVisible: boolean) => void
  resetProductReviewsData: () => void
  setTotalReviewsCount: (value: number) => void
  setShouldRevalidateStatistics: (value: boolean) => void
  shouldRevalidateStatistics: boolean
  reviewsStatistics: IProductReviewsStatistics | null,
  setReviewsStatistics: (value: IProductReviewsStatistics | null) => void
}

export const checkIfUserReviewExists = (review: Review | null): boolean => {
  return !!review && !Object.values(review).every(prop => prop === null)
}

export const useProductReviewsStore = create<ReviewsStoreState>()(
  persist(
    (set) => ({
      currentPage: 0,
      totalElements: 0,
      totalPages: 0,
      shouldRevalidateStatistics: true,
      reviewsStatistics: null,

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
        set(state => ({
          ...state,
          wasRend: true
        }))
      },
      resetProductReviewsData: () => {
        set((state) => ({
          ...state,
          reviewsWithRatings: [],
          filteredReviewsWithRatings: [],
          currentPage: 0,
          currentSize: 0,
          totalPages: 0,
          totalElements: 0,
          userReview: null,
          wasRend: false,
        }))
      },
      setTotalReviewsCount: (value: number) => {
        set(state => ({
          ...state,
          totalElements: value,
        }))
      },
      setShouldRevalidateStatistics: (value: boolean) => {
        set(state => ({
          ...state,
          shouldRevalidateStatistics: value,
        }))
      },
      setReviewsStatistics: (value: IProductReviewsStatistics | null) => {
        set(state => ({
          ...state,
          reviewsStatistics: value,
        }))
      },
    }),
    {
      name: 'productReviews',
    },
  ),
)
