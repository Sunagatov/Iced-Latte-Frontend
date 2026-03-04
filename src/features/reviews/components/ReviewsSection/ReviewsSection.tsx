'use client'
import ReviewForm from '../ReviewForm/ReviewForm'
import React, { useCallback, useEffect, useRef, useState } from 'react'
import { useErrorHandler } from '@/shared/utils/apiError'
import { Review } from '@/features/reviews/types'
import { useAuthStore } from '@/features/auth/store'
import { useReviews } from '@/features/reviews/hooks'
import { apiGetProductUserReview } from '@/features/reviews/api'
import Loader from '@/shared/components/Loader/Loader'
import ReviewsList from '@/features/reviews/components/ReviewsList/ReviewsList'
import ReviewsSorter from '@/features/reviews/components/ReviewsSorter/ReviewsSorter'
import { reviewsSortOptions } from '@/features/reviews/constants'
import { checkIfUserReviewExists, useProductReviewsStore } from '@/features/reviews/store'
import { apiGetProductReviewsStatistics } from '@/features/reviews/api'
import { IOption } from '@/shared/types/Dropdown'
import { ISortParams } from '@/shared/types/ISortParams'
import { getDefaultSortOption } from '@/shared/utils/getDefaultSortOption'
import { IProduct } from '@/features/products/types'
import AIReviewSummary from '@/features/reviews/components/AIReviewSummary/AIReviewSummary'
import { useOnClickOutside } from 'usehooks-ts'
import { FaStar } from 'react-icons/fa'

interface ReviewComponentProps {
  product: IProduct
}

const ReviewsSection = ({ product }: ReviewComponentProps) => {
  const { id: productId } = product
  const { errorMessage, handleError } = useErrorHandler()
  const { token } = useAuthStore()
  const { reviewsStatistics, setReviewsStatistics } = useProductReviewsStore()

  const [userReview, setUserReview] = useState<Review | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [selectedFilterRating, setSelectedFilterRating] = useState<number[]>([])
  const [showFilterDropdown, setShowFilterDropdown] = useState(false)
  const [selectedSortOption, setSelectedSortOption] = useState<IOption<ISortParams>>(
    () => getDefaultSortOption(reviewsSortOptions)
  )
  const filterRef = useRef<HTMLDivElement>(null)
  useOnClickOutside(filterRef as any, () => setShowFilterDropdown(false))

  const refreshStatistics = useCallback(async () => {
    try {
      const stats = await apiGetProductReviewsStatistics(productId)
      setReviewsStatistics(stats)
    } catch { /* ignore */ }
  }, [productId, setReviewsStatistics])

  // Load user's existing review on mount
  useEffect(() => {
    if (!token) return
    apiGetProductUserReview(productId)
      .then((review) => {
        if (checkIfUserReviewExists(review)) {
          setUserReview(review)
        }
      })
      .catch(() => {/* no review yet */})
  }, [productId, token])

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
    return <h1 className="grid h-screen place-items-center text-4xl text-black">Something went wrong!</h1>
  }

  if (isLoading) {
    return <div className="mt-14 flex h-[54px] items-center justify-center"><Loader /></div>
  }

  return (
    <div data-testid="reviews-section" className="mx-auto max-w-[1157px] pb-16">
      <h2 className="mb-8 text-3xl font-bold tracking-tight text-primary">Rating and reviews</h2>

      <div className="flex flex-col gap-6 lg:flex-row lg:items-start">

        {/* Left: AI summary + write review + reviews list */}
        <div className="flex min-w-0 flex-1 flex-col">

          {product.aiSummary && (
            <div className="mb-6">
              <AIReviewSummary summary={product.aiSummary} reviewsCount={reviewsStatistics?.reviewsCount ?? product.reviewsCount} />
            </div>
          )}

          {!userReview && (
            <ReviewForm
              productId={productId}
              hasReviews={reviews.length > 0}
              showForm={showForm}
              setShowForm={setShowForm}
              onReviewSubmitted={(review) => {
                setUserReview(review)
                setShowForm(false)
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
                  onClick={() => setShowFilterDropdown(v => !v)}
                  className={`flex items-center gap-1.5 rounded-[40px] border-2 px-5 py-3 text-base font-medium transition-all duration-200 active:scale-95 ${
                    showFilterDropdown || selectedFilterRating.length > 0
                      ? 'border-brand-solid bg-secondary text-primary'
                      : 'border-transparent bg-secondary text-primary hover:bg-tertiary'
                  }`}
                >
                  Filter
                  {selectedFilterRating.length > 0 && (
                    <span className="flex h-4 w-4 items-center justify-center rounded-full bg-brand-solid text-[10px] font-bold text-white">
                      {selectedFilterRating.length}
                    </span>
                  )}
                  <FaStar className="h-3 w-3 text-positive" />
                </button>
                {showFilterDropdown && (
                  <div className="absolute right-0 top-[calc(100%+8px)] z-10 w-56 rounded-xl border border-primary bg-primary shadow-xl">
                    <div className="flex flex-col gap-0.5 p-2">
                      {[5,4,3,2,1].map((value) => {
                        const count = reviewsStatistics.ratingMap[`star${value}`] ?? 0
                        const total = reviewsStatistics.reviewsCount ?? 0
                        const pct = total > 0 ? Math.round((count / total) * 100) : 0
                        const isChecked = selectedFilterRating.includes(value)
                        return (
                          <button
                            key={value}
                            onClick={() => ratingFilterChangeHandler(value)}
                            className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors ${
                              isChecked ? 'bg-brand-second font-semibold' : 'hover:bg-tertiary'
                            }`}
                          >
                            <span className="w-3 text-right font-semibold text-primary">{value}</span>
                            <FaStar className="h-3.5 w-3.5 shrink-0 text-positive" />
                            <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-secondary">
                              <div className="h-full rounded-full bg-positive transition-all duration-300" style={{ width: `${pct}%` }} />
                            </div>
                            <span className="w-5 text-right text-xs text-tertiary">{count}</span>
                          </button>
                        )
                      })}
                    </div>
                  </div>
                )}
              </div>
            </ReviewsSorter>
          )}

          {(reviews.length > 0 || userReview) && (
            <ReviewsList
              productId={productId}
              reviews={reviews}
              showMoreReviews={showMoreReviews}
              isFetchingNextPage={isFetchingNextPage}
              hasNextPage={hasNextPage}
              userReview={userReview}
              onReviewDeleted={(id) => {
                setUserReview(null)
                removeReviewFromCache(id)
                void refreshStatistics()
              }}
              onReviewRated={(updated) => updateReviewInCache(updated)}
            />
          )}

          {reviews.length === 0 && selectedFilterRating.length > 0 && (
            <p className="text-sm text-tertiary">No reviews match this filter.</p>
          )}
          {errorMessage && <div className="mt-4 text-negative">{errorMessage}</div>}
        </div>

      </div>
    </div>
  )
}

export default ReviewsSection
