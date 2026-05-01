'use client'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useOnClickOutside } from 'usehooks-ts'
import { useAuthStore } from '@/features/auth/store'
import type { IProduct } from '@/features/products/types'
import {
  apiGetProductUserReview,
} from '@/features/reviews/api'
import { reviewsSortOptions } from '@/features/reviews/constants'
import { useReviews } from '@/features/reviews/hooks'
import {
  checkIfUserReviewExists,
} from '@/features/reviews/store'
import type { IOption } from '@/shared/types/Dropdown'
import type { ISortParams } from '@/shared/types/ISortParams'
import { getDefaultSortOption } from '@/shared/utils/getDefaultSortOption'
import { useErrorHandler } from '@/shared/utils/apiError'
import ReviewForm from '../ReviewForm/ReviewForm'
import type {
  IProductReviewsStatistics,
  Review,
} from '@/features/reviews/types'
import Loader from '@/shared/ui/Loader/Loader'
import ReviewsList from '@/features/reviews/components/ReviewsList/ReviewsList'
import ReviewsSorter from '@/features/reviews/components/ReviewsSorter/ReviewsSorter'
import AIReviewSummary from '@/features/reviews/components/AIReviewSummary/AIReviewSummary'
import ReviewsFilter from '@/features/reviews/components/ReviewsFilter/ReviewsFilter'

interface ReviewComponentProps {
  product: IProduct
  reviewsStatistics: IProductReviewsStatistics | null
  refreshStatistics: () => Promise<void>
}

const ReviewsSection = ({
  product,
  reviewsStatistics,
  refreshStatistics,
}: ReviewComponentProps) => {
  const { id: productId } = product
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
  }, [isLoggedIn, productId, refreshUserReview])

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
      hasFilterResults:
        reviewsState.data.length > 0 || selectedFilterRating.length === 0,
      hasStatistics: Boolean(reviewsStatistics && reviewsCount > 0),
      reviewsCount,
    }
  }, [
    reviewsState.data.length,
    reviewsStatistics,
    selectedFilterRating.length,
    userReview,
  ])

  if (reviewsState.error) {
    return (
      <div className="rounded-2xl border border-black/8 bg-white p-6 shadow-sm">
        <p className="text-primary text-sm font-medium">
          Failed to load reviews.
        </p>
        <p className="text-tertiary mt-1 text-sm">Please try again.</p>
        <button
          className="bg-brand text-inverted hover:bg-brand-solid-hover mt-4 rounded-xl px-4 py-2 text-sm font-semibold transition"
          onClick={() => void reviewsState.refreshReviews()}
        >
          Retry
        </button>
      </div>
    )
  }

  if (reviewsState.isLoading) {
    return (
      <div className="mt-14 flex h-[54px] items-center justify-center">
        <Loader />
      </div>
    )
  }

  return (
    <div data-testid="reviews-section" className="mx-auto max-w-[1157px] pb-16">
      <h2 className="text-primary mb-8 text-3xl font-bold tracking-tight">
        Rating and reviews
      </h2>

      <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
        {/* Left: AI summary + write review + reviews list */}
        <div className="flex min-w-0 flex-1 flex-col">
          {product.aiSummary && (
            <div className="mb-6">
              <AIReviewSummary
                summary={product.aiSummary}
                reviewsCount={
                  reviewsStatistics?.reviewsCount ?? product.reviewsCount
                }
              />
            </div>
          )}

          {!userReview && (
            <ReviewForm
              productId={productId}
              showForm={showForm}
              setShowForm={setShowForm}
              onReviewSubmitted={handleReviewSubmitted}
            />
          )}

          {reviewsStatistics && reviewsSummary.hasStatistics && (
            <ReviewsSorter
              selectedOption={selectedSortOption}
              selectOption={setSelectedSortOption}
              userReview={userReview}
            >
              <ReviewsFilter
                filterRef={filterRef}
                reviewsStatistics={reviewsStatistics}
                selectedFilterRating={selectedFilterRating}
                showFilterDropdown={showFilterDropdown}
                setShowFilterDropdown={setShowFilterDropdown}
                toggleRatingFilter={toggleRatingFilter}
                clearRatingFilters={clearRatingFilters}
              />
            </ReviewsSorter>
          )}

          {reviewsSummary.hasAnyReviews ? (
            <ReviewsList
              productId={productId}
              reviews={reviewsState.data}
              showMoreReviews={handleShowMoreReviews}
              isFetchingNextPage={reviewsState.isFetchingNextPage}
              hasNextPage={reviewsState.hasNextPage}
              userReview={userReview}
              onReviewDeleted={handleReviewDeleted}
              onReviewRated={(updated) => reviewsState.updateReviewInCache(updated)}
            />
          ) : (
            !reviewsState.isLoading &&
            reviewsSummary.reviewsCount === 0 && (
              <div className="border-primary/60 mt-6 rounded-2xl border bg-white p-8 text-center shadow-sm">
                <p className="text-primary text-base font-semibold">
                  No reviews yet
                </p>
                <p className="text-tertiary mt-1 text-sm">
                  Be the first to review this product
                </p>
              </div>
            )
          )}

          {reviewsState.data.length === 0 && selectedFilterRating.length > 0 && (
            <div className="text-tertiary mt-4 flex items-center gap-3 text-sm">
              <span>No reviews match this filter.</span>
              <button
                onClick={clearRatingFilters}
                className="text-brand font-medium hover:underline"
              >
                Clear filters
              </button>
            </div>
          )}
          {errorMessage && (
            <div className="text-negative mt-4">{errorMessage}</div>
          )}
        </div>
      </div>
    </div>
  )
}

export default ReviewsSection
