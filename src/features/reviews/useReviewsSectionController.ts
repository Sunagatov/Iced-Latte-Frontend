'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useOnClickOutside } from 'usehooks-ts'
import { useAuthStore } from '@/features/auth/store'
import { apiGetProductUserReview } from '@/features/reviews/api'
import { reviewsSortOptions } from '@/features/reviews/constants'
import { useReviews } from '@/features/reviews/hooks'
import { checkIfUserReviewExists } from '@/features/reviews/store'
import type {
  IProductReviewsStatistics,
  Review,
} from '@/features/reviews/types'
import type { IOption } from '@/shared/types/Dropdown'
import type { ISortParams } from '@/shared/types/ISortParams'
import { useErrorHandler } from '@/shared/utils/apiError'
import { getDefaultSortOption } from '@/shared/utils/getDefaultSortOption'

interface UseReviewsSectionControllerParams {
  productId: string
  reviewsStatistics: IProductReviewsStatistics | null
  refreshStatistics: () => Promise<void>
}

export function useReviewsSectionController({
  productId,
  reviewsStatistics,
  refreshStatistics,
}: UseReviewsSectionControllerParams) {
  const { errorMessage, handleError } = useErrorHandler()
  const isLoggedIn = useAuthStore((state) => state.isLoggedIn)
  const [userReview, setUserReview] = useState<Review | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [selectedFilterRating, setSelectedFilterRating] = useState<number[]>([])
  const [showFilterDropdown, setShowFilterDropdown] = useState(false)
  const [selectedSortOption, setSelectedSortOption] = useState<
    IOption<ISortParams>
  >(() => getDefaultSortOption(reviewsSortOptions))
  const filterRef = useRef<HTMLDivElement>(null)

  useOnClickOutside(filterRef as React.RefObject<HTMLDivElement>, () =>
    setShowFilterDropdown(false),
  )

  const refreshUserReview = useCallback(() => {
    apiGetProductUserReview(productId).then(
      (review) => {
        setUserReview(checkIfUserReviewExists(review) ? review : null)
      },
      () => setUserReview(null),
    )
  }, [productId])

  useEffect(() => {
    if (!isLoggedIn) {
      setUserReview(null)

      return
    }

    void refreshUserReview()
  }, [isLoggedIn, refreshUserReview])

  const reviewsState = useReviews({
    productId,
    userReview,
    sortOption: selectedSortOption,
    ratingFilter: selectedFilterRating,
  })

  const toggleRatingFilter = useCallback((value: number) => {
    setSelectedFilterRating((previous) => {
      const index = previous.indexOf(value)

      return index === -1 ? [...previous, value] : previous.toSpliced(index, 1)
    })
  }, [])

  const clearRatingFilters = useCallback(() => {
    setSelectedFilterRating([])
  }, [])

  const handleShowMoreReviews = useCallback(() => {
    reviewsState.fetchNext().catch((error) => handleError(error))
  }, [handleError, reviewsState])

  const handleReviewSubmitted = useCallback(() => {
    void refreshUserReview()
    void reviewsState.refreshReviews()
    void refreshStatistics()
  }, [refreshStatistics, refreshUserReview, reviewsState])

  const handleReviewDeleted = useCallback(
    (reviewId: string) => {
      void refreshUserReview()
      reviewsState.removeReviewFromCache(reviewId)
      void refreshStatistics()
    },
    [refreshStatistics, refreshUserReview, reviewsState],
  )

  const reviewsSummary = useMemo(() => {
    const reviewsCount = reviewsStatistics?.reviewsCount ?? 0

    return {
      hasAnyReviews: reviewsState.data.length > 0 || !!userReview,
      hasStatistics: Boolean(reviewsStatistics && reviewsCount > 0),
      reviewsCount,
    }
  }, [
    reviewsState.data.length,
    reviewsStatistics,
    userReview,
  ])

  return {
    clearRatingFilters,
    errorMessage,
    filterRef,
    handleReviewDeleted,
    handleReviewSubmitted,
    handleShowMoreReviews,
    reviewsState,
    reviewsSummary,
    selectedFilterRating,
    selectedSortOption,
    setSelectedSortOption,
    setShowFilterDropdown,
    setShowForm,
    showFilterDropdown,
    showForm,
    toggleRatingFilter,
    userReview,
  }
}
