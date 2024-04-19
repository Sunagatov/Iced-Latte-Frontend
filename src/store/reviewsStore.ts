import {create} from 'zustand'
import {persist} from 'zustand/middleware'
import {apiGetProductReviews, apiGetProductUserReview,} from '@/services/reviewService'
import {Review} from '@/types/ProductReviewType'

interface IGetProductReviews {
  reviewsWithRatings: Review[]
  currentPage: number
  totalElements: number
  totalPages: number
  currentSize: number
}

export const isIGetProductReviews = (object: object): object is IGetProductReviews  => {
  return 'reviewsWithRatings' in object
    && 'currentPage' in object
    && 'totalElements' in object
    && 'totalPages' in object
    && 'currentSize' in object
}

export interface ISetProductReviewsData {
  reviewsData: IGetProductReviews
  userReview: Review | null
}

interface ReviewsStoreState {
  setwasRend: () => void
  wasRend: boolean
  reviewsWithRatings: Review[]
  filteredReviewsWithRatings: Review[]
  currentPage: number
  currentSize: number
  totalElements: number
  totalPages: number
  userReview: Review | null
  isReviewFormVisible: boolean
  isReviewButtonVisible: boolean
  isReviewRatingFormVisible: boolean
  setIsReviewFormVisible: (isVisible: boolean) => void
  setIsReviewButtonVisible: (isVisible: boolean) => void
  setIsRaitingFormVisible: (isVisible: boolean) => void
  getProductReviews: (productId: string, page?: number, size?: number) => Promise<IGetProductReviews>
  getProductUserReview: (productId: string) => Promise<Review>
  setProductReviewsData: (data: ISetProductReviewsData) => void
  updateProductReviewsData: (data: ISetProductReviewsData) => void
  syncReviewsDataOnLogin: (userReview: Review) => void
  syncReviewsDataOnLogout: () => void
  resetProductReviewsData: () => void
}

export const checkIfUserReviewExists = (review: Review | null): boolean => {
  return !!review && !Object.values(review).every(prop => prop === null)
}



export const useProductReviewsStore = create<ReviewsStoreState>()(
  persist(
    (set) => ({
      reviewsWithRatings: [],
      filteredReviewsWithRatings: [],
      currentPage: 0,
      currentSize: 0,
      totalElements: 0,
      totalPages: 0,
      userReview: null,
      wasRend: false,

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

      getProductReviews: async (productId: string, page?: number, size?: number): Promise<IGetProductReviews> => {
        const {
          reviewsWithRatings,
          totalElements,
          totalPages,
          // size: currentSize,
          // page: currentPage,
        } = await apiGetProductReviews(productId, page, size)

        return {
          reviewsWithRatings,
          totalElements,
          totalPages,
          currentPage: page || 0,
          currentSize: size || 0,
        }
      },
      setProductReviewsData: (data: ISetProductReviewsData) => {
        const {
          reviewsData: {
            reviewsWithRatings,
            currentSize,
            currentPage,
            totalPages,
            totalElements,
          },
          userReview,
        } = data

        if (checkIfUserReviewExists(userReview)) {
          set((state) => ({
            ...state,
            userReview,
            reviewsWithRatings: [
              ...state.reviewsWithRatings,
              ...reviewsWithRatings,
            ],
            filteredReviewsWithRatings: [
              ...state.filteredReviewsWithRatings,
              ...reviewsWithRatings.filter(review => review.productReviewId !== userReview?.productReviewId),
            ],
          }))
        } else {
          set((state) => ({
            ...state,
            userReview: null,
            reviewsWithRatings: [
              ...state.reviewsWithRatings,
              ...reviewsWithRatings,
            ],
            filteredReviewsWithRatings: [
              ...state.filteredReviewsWithRatings,
              ...reviewsWithRatings,
            ],
          }))
        }

        set((state) => ({
          ...state,
          currentPage,
          currentSize,
          totalElements,
          totalPages,
        }))
      },
      updateProductReviewsData: (data: ISetProductReviewsData) => {
        const {
          reviewsData: {
            reviewsWithRatings,
            currentSize,
            currentPage,
            totalPages,
            totalElements,
          },
          userReview,
        } = data

        if (checkIfUserReviewExists(userReview)) {
          set((state) => ({
            ...state,
            userReview,
            reviewsWithRatings,
            filteredReviewsWithRatings: reviewsWithRatings.filter(review => review.productReviewId !== userReview?.productReviewId),

          }))
        } else {
          set((state) => ({
            ...state,
            userReview: null,
            reviewsWithRatings,
            filteredReviewsWithRatings: reviewsWithRatings,
          }))
        }

        set((state) => ({
          ...state,
          currentPage,
          currentSize,
          totalElements,
          totalPages,
        }))
      },

      syncReviewsDataOnLogin: (userReview: Review) => {
        if (checkIfUserReviewExists(userReview)) {
          set((state) => ({
            ...state,
            userReview,
            filteredReviewsWithRatings: state.reviewsWithRatings
              .filter(review => review.productReviewId !== userReview?.productReviewId),
          }))
        }
      },
      syncReviewsDataOnLogout: () => {
        set((state) => ({
          ...state,
          userReview: null,
          filteredReviewsWithRatings: [...state.reviewsWithRatings],
        }))
      },
      getProductUserReview: async (productId: string): Promise<Review> => {
        return await apiGetProductUserReview(productId)
      },
    }),
    {
      name: 'productReviews',
    },
  ),
)
