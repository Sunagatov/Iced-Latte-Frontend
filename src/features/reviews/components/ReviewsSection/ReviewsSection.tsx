'use client'
import ReviewRatingFilter from '@/features/reviews/components/ReviewRatingFilter/ReviewRatingFilter'
import ReviewForm from '../ReviewForm/ReviewForm'
import React, { useCallback, useEffect, useState } from 'react'
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
import { twMerge } from 'tailwind-merge'

interface ReviewComponentProps {
  product: IProduct
}

const ReviewsSection = ({ product }: ReviewComponentProps) => {
  const { id: productId } = product
  const { errorMessage, handleError } = useErrorHandler()
  const { token } = useAuthStore()

  const [userReview, setUserReview] = useState<Review | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [selectedFilterRating, setSelectedFilterRating] = useState<number[]>([])
  const [selectedSortOption, setSelectedSortOption] = useState<IOption<ISortParams>>(
    () => getDefaultSortOption(reviewsSortOptions)
  )

  const { reviewsStatistics, setReviewsStatistics } = useProductReviewsStore()

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
    <div data-testid="reviews-section" className={twMerge('mx-auto max-w-[1157px] pb-16', reviews.length > 0 ? '' : 'xl:mb-20')}>
      <h2 className="mb-8 text-3xl font-bold tracking-tight text-primary">Rating and reviews</h2>

      {reviewsStatistics && reviewsStatistics.reviewsCount > 0 && (
        <div className="mb-8">
          <ReviewRatingFilter
            onChange={ratingFilterChangeHandler}
            selectedOptions={selectedFilterRating}
          />
        </div>
      )}

      <div className="xl:max-w-[720px]">
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

        {(reviews.length > 0 || userReview) && (
          <>
            <ReviewsSorter
              selectedOption={selectedSortOption}
              selectOption={setSelectedSortOption}
              userReview={userReview}
            />
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
          </>
        )}
        {errorMessage && <div className="mt-4 text-negative">{errorMessage}</div>}
      </div>
    </div>
  )
}

export default ReviewsSection
