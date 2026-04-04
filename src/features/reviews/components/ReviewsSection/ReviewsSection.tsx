'use client'
import ReviewForm from '../ReviewForm/ReviewForm'
import React, { useCallback, useEffect, useRef, useState } from 'react'
import { useErrorHandler } from '@/shared/utils/apiError'
import { Review, IProductReviewsStatistics } from '@/features/reviews/types'
import { useAuthStore } from '@/features/auth/store'
import { useReviews } from '@/features/reviews/hooks'
import { apiGetProductUserReview } from '@/features/reviews/api'
import Loader from '@/shared/components/Loader/Loader'
import ReviewsList from '@/features/reviews/components/ReviewsList/ReviewsList'
import ReviewsSorter from '@/features/reviews/components/ReviewsSorter/ReviewsSorter'
import { reviewsSortOptions } from '@/features/reviews/constants'
import { checkIfUserReviewExists } from '@/features/reviews/store'
import { IOption } from '@/shared/types/Dropdown'
import { ISortParams } from '@/shared/types/ISortParams'
import { getDefaultSortOption } from '@/shared/utils/getDefaultSortOption'
import { IProduct } from '@/features/products/types'
import AIReviewSummary from '@/features/reviews/components/AIReviewSummary/AIReviewSummary'
import { useOnClickOutside } from 'usehooks-ts'
import { FaStar } from 'react-icons/fa'

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
  const isLoggedIn: boolean = useAuthStore((s) => s.isLoggedIn)

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
    refreshUserReview()
  }, [productId, isLoggedIn, refreshUserReview])

  const {
    data: reviews,
    fetchNext,
    hasNextPage,
    isLoading,
    isFetchingNextPage,
    error,
    refreshReviews,
    removeReviewFromCache,
    updateReviewInCache,
  } = useReviews({
    productId,
    userReview,
    sortOption: selectedSortOption,
    ratingFilter: selectedFilterRating,
  })

  const ratingFilterChangeHandler = (value: number) => {
    setSelectedFilterRating((prev) => {
      const idx = prev.indexOf(value)

      return idx === -1 ? [...prev, value] : prev.toSpliced(idx, 1)
    })
  }

  const showMoreReviews = () => fetchNext().catch((e) => handleError(e))

  if (error) {
    return (
      <div className="rounded-2xl border border-black/8 bg-white p-6 shadow-sm">
        <p className="text-primary text-sm font-medium">
          Failed to load reviews.
        </p>
        <p className="text-tertiary mt-1 text-sm">Please try again.</p>
        <button
          className="bg-brand text-inverted hover:bg-brand-solid-hover mt-4 rounded-xl px-4 py-2 text-sm font-semibold transition"
          onClick={() => void refreshReviews()}
        >
          Retry
        </button>
      </div>
    )
  }

  if (isLoading) {
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
              onReviewSubmitted={() => {
                refreshUserReview()
                refreshReviews()
                void refreshStatistics()
              }}
            />
          )}

          {reviewsStatistics && reviewsStatistics.reviewsCount > 0 && (
            <ReviewsSorter
              selectedOption={selectedSortOption}
              selectOption={setSelectedSortOption}
              userReview={userReview}
            >
              <div ref={filterRef} className="relative">
                <button
                  onClick={() => setShowFilterDropdown((v) => !v)}
                  className={`flex items-center gap-1.5 rounded-[40px] border-2 px-5 py-3 text-base font-medium transition-all duration-200 active:scale-95 ${
                    showFilterDropdown || selectedFilterRating.length > 0
                      ? 'border-brand-solid bg-secondary text-primary'
                      : 'bg-secondary text-primary hover:bg-tertiary border-transparent'
                  }`}
                >
                  Filter
                  {selectedFilterRating.length > 0 && (
                    <span className="bg-brand-solid flex h-4 w-4 items-center justify-center rounded-full text-[10px] font-bold text-white">
                      {selectedFilterRating.length}
                    </span>
                  )}
                  <FaStar className="text-positive h-3 w-3" />
                </button>
                {showFilterDropdown && (
                  <div className="border-primary bg-primary absolute top-[calc(100%+8px)] right-0 z-10 w-56 rounded-xl border shadow-xl">
                    <div className="flex flex-col gap-0.5 p-2">
                      {[5, 4, 3, 2, 1].map((value) => {
                        const count =
                          reviewsStatistics.ratingMap[`star${value}`] ?? 0
                        const total = reviewsStatistics.reviewsCount ?? 0
                        const pct =
                          total > 0 ? Math.round((count / total) * 100) : 0
                        const isChecked = selectedFilterRating.includes(value)

                        return (
                          <button
                            key={value}
                            onClick={() => ratingFilterChangeHandler(value)}
                            className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors ${
                              isChecked
                                ? 'bg-brand-second font-semibold'
                                : 'hover:bg-tertiary'
                            }`}
                          >
                            <span className="text-primary w-3 text-right font-semibold">
                              {value}
                            </span>
                            <FaStar className="text-positive h-3.5 w-3.5 shrink-0" />
                            <div className="bg-secondary h-1.5 flex-1 overflow-hidden rounded-full">
                              <div
                                className="bg-positive h-full rounded-full transition-all duration-300"
                                style={{ width: `${pct}%` }}
                              />
                            </div>
                            <span className="text-tertiary w-5 text-right text-xs">
                              {count}
                            </span>
                          </button>
                        )
                      })}
                    </div>
                    {selectedFilterRating.length > 0 && (
                      <div className="border-primary/10 border-t px-3 py-2">
                        <button
                          onClick={() => setSelectedFilterRating([])}
                          className="text-brand text-xs font-medium hover:underline"
                        >
                          Clear filters
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </ReviewsSorter>
          )}

          {reviews.length > 0 || userReview ? (
            <ReviewsList
              productId={productId}
              reviews={reviews}
              showMoreReviews={showMoreReviews}
              isFetchingNextPage={isFetchingNextPage}
              hasNextPage={hasNextPage}
              userReview={userReview}
              onReviewDeleted={(id) => {
                refreshUserReview()
                removeReviewFromCache(id)
                void refreshStatistics()
              }}
              onReviewRated={(updated) => updateReviewInCache(updated)}
            />
          ) : (
            !isLoading &&
            reviewsStatistics?.reviewsCount === 0 && (
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

          {reviews.length === 0 && selectedFilterRating.length > 0 && (
            <div className="text-tertiary mt-4 flex items-center gap-3 text-sm">
              <span>No reviews match this filter.</span>
              <button
                onClick={() => setSelectedFilterRating([])}
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
