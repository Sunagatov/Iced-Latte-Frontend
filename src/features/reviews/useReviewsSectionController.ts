'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type * as React from 'react'
import { useOnClickOutside } from 'usehooks-ts'
import { useAuthStore } from '@/features/auth/public'
import { captureAccountScope, useAccountScopeKey } from '@/features/auth/accountScope'
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
  const authStatus = useAuthStore((state) => state.status)
  const accountKey = useAccountScopeKey()
  const reviewKey = JSON.stringify([accountKey, productId])
  const isLoggedIn = authStatus === 'authenticated'
  const [lookup, setLookup] = useState<{
    key: string
    review: Review | null
    error: string | null
    loading: boolean
  }>({ key: reviewKey, review: null, error: null, loading: authStatus !== 'anonymous' })
  const ownsLookup = lookup.key === reviewKey
  const userReview = ownsLookup ? lookup.review : null
  const userReviewError = ownsLookup ? lookup.error : null
  const isUserReviewLoading = ownsLookup ? lookup.loading : authStatus !== 'anonymous'
  const [showForm, setShowForm] = useState(false)
  const [selectedFilterRating, setSelectedFilterRating] = useState<number[]>([])
  const [showFilterDropdown, setShowFilterDropdown] = useState(false)
  const [selectedSortOption, setSelectedSortOption] = useState<
    IOption<ISortParams>
  >(() => getDefaultSortOption(reviewsSortOptions))
  const filterRef = useRef<HTMLDivElement>(null)
  const reviewRequestRef = useRef(0)

  useOnClickOutside(filterRef as React.RefObject<HTMLDivElement>, () =>
    setShowFilterDropdown(false),
  )

  const refreshUserReview = useCallback(async () => {
    const account = captureAccountScope()

    if (account.key !== accountKey) return
    const requestId = ++reviewRequestRef.current
    const isCurrent = () => requestId === reviewRequestRef.current && account.isCurrent()

    setLookup((previous) => ({
      key: reviewKey,
      review: previous.key === reviewKey ? previous.review : null,
      error: null,
      loading: true,
    }))

    try {
      const review = await apiGetProductUserReview(productId)

      if (!isCurrent()) return
      const nextUserReview = checkIfUserReviewExists(review) ? review : null

      setLookup({ key: reviewKey, review: nextUserReview, error: null, loading: false })

      if (nextUserReview) {
        setShowForm(false)
      }
    } catch {
      if (isCurrent()) {
        setLookup((previous) => ({
          ...previous,
          error: 'Could not check your review. Please try again.',
          loading: false,
        }))
      }
    }
  }, [accountKey, productId, reviewKey])

  useEffect(() => {
    setLookup({ key: reviewKey, review: null, error: null, loading: authStatus !== 'anonymous' })
    setShowForm(false)
    if (isLoggedIn) void refreshUserReview()

    return () => {
      reviewRequestRef.current += 1
    }
  }, [authStatus, isLoggedIn, refreshUserReview, reviewKey])

  const reviewsState = useReviews({
    productId,
    userReview,
    sortOption: selectedSortOption,
    ratingFilter: selectedFilterRating,
  })

  useEffect(() => {
    if (userReview) {
      setShowForm(false)
    }
  }, [userReview])

  const visibleReviewData = useMemo(() => {
    if (!userReview) {
      return reviewsState.data
    }

    return reviewsState.data.filter(
      (review) => review.productReviewId !== userReview.productReviewId,
    )
  }, [userReview, reviewsState.data])

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
      void reviewsState.refreshReviews()
      void refreshStatistics()
    },
    [refreshStatistics, refreshUserReview, reviewsState],
  )

  const reviewsSummary = useMemo(() => {
    const reviewsCount = reviewsStatistics?.reviewsCount ?? 0

    return {
      hasAnyReviews: visibleReviewData.length > 0 || !!userReview,
      hasStatistics: Boolean(reviewsStatistics && reviewsCount > 0),
      reviewsCount,
    }
  }, [visibleReviewData.length, reviewsStatistics, userReview])

  return {
    clearRatingFilters,
    errorMessage,
    filterRef,
    handleReviewDeleted,
    handleReviewSubmitted,
    handleShowMoreReviews,
    reviewsState: {
      ...reviewsState,
      data: visibleReviewData,
    },
    reviewsSummary,
    selectedFilterRating,
    selectedSortOption,
    isUserReviewLoading,
    userReviewError,
    refreshUserReview,
    setSelectedSortOption,
    setShowFilterDropdown,
    setShowForm,
    showFilterDropdown,
    showForm,
    toggleRatingFilter,
    userReview: userReview,
  }
}
