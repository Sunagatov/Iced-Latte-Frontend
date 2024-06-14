'use client'
import ReviewRatingFilter from '@/components/Review/ReviewRatingFilter/ReviewRatingFilter'
import ReviewForm from '../ReviewForm/ReviewForm'
import React, { useEffect, useState } from 'react'
import { useErrorHandler } from '@/services/apiError/apiError'
import { Review } from '@/types/ReviewType'
import { useAuthStore } from '@/store/authStore'
import { useReviews } from '@/hooks/useReviews'
import { apiGetProductUserReview } from '@/services/reviewService'
import Loader from '@/components/UI/Loader/Loader'
import ReviewsList from '@/components/Review/ReviewsList/ReviewsList'
import ReviewsSorter from '@/components/Review/ReviewsSorter/ReviewsSorter'
import { reviewsSortOptions } from '@/constants/reviewsSortOptions'
import {
  checkIfUserReviewExists,
  useProductReviewsStore,
} from '@/store/reviewsStore'
import { IOption } from '@/types/Dropdown'
import { ISortParams } from '@/types/ISortParams'
import { getDefaultSortOption } from '@/utils/getDefaultSortOption'
import { IProduct } from '@/types/Products'
import { twMerge } from 'tailwind-merge'

interface ReviewComponentProps {
  product: IProduct
}

const ReviewsSection = ({ product }: ReviewComponentProps) => {
  const { id: productId } = product

  const { errorMessage, handleError } = useErrorHandler()
  const { token } = useAuthStore()
  const [userReview, setUserReview] = useState<Review | null>(null)

  const {
    setIsReviewButtonVisible,
    shouldRevalidateReviews,
    setShouldRevalidateReviews,
    shouldRevalidateUserReview,
    setShouldRevalidateUserReview,
    reviewsStatistics,
  } = useProductReviewsStore()

  useEffect(() => {
    const getUserReview = async (productId: string) => {
      try {
        const userReview = await apiGetProductUserReview(productId)

        setShouldRevalidateUserReview(false)

        if (checkIfUserReviewExists(userReview)) {
          setUserReview(userReview)
          setIsReviewButtonVisible(false)
        } else {
          setUserReview(null)
          setIsReviewButtonVisible(true)
        }
      } catch (error) {
        handleError(error)
        setShouldRevalidateReviews(true)
        setUserReview(null)
      }
    }

    if (token && shouldRevalidateUserReview) {
      void getUserReview(productId)
    }
  }, [
    handleError,
    productId,
    setIsReviewButtonVisible,
    setShouldRevalidateReviews,
    setShouldRevalidateUserReview,
    shouldRevalidateUserReview,
    token,
  ])

  useEffect(() => {
    return () => setShouldRevalidateUserReview(true)
  }, [setShouldRevalidateUserReview])

  const [selectedFilterRating, setSelectedFilterRating] = useState<number[]>([])

  const ratingFilterChangeHandler = (value: number) => {
    setSelectedFilterRating((prevState) => {
      const indexOfValue = prevState.indexOf(value)

      if (indexOfValue === -1) {
        return prevState.toSpliced(prevState.length, 0, value)
      }

      return prevState.toSpliced(indexOfValue, 1)
    })
  }

  const [selectedSortOption, setSelectedSortOption] = useState<
    IOption<ISortParams>
  >(() => getDefaultSortOption(reviewsSortOptions))

  const selectSortOptionHandler = (option: IOption<ISortParams>) => {
    setSelectedSortOption(option)
  }

  const {
    data: reviews,
    fetchNext,
    hasNextPage,
    isLoading,
    isFetchingNextPage,
    error,
    refreshReviews,
  } = useReviews({
    productId,
    userReview,
    sortOption: selectedSortOption,
    ratingFilter: selectedFilterRating,
  })

  useEffect(() => {
    async function refreshProductReviews() {
      try {
        await refreshReviews()
      } catch (error) {
        handleError(error)
      } finally {
        setShouldRevalidateReviews(false)
      }
    }

    if (shouldRevalidateReviews) {
      void refreshProductReviews()
    }
  }, [
    shouldRevalidateReviews,
    setShouldRevalidateReviews,
    handleError,
    refreshReviews,
  ])

  const showMoreReviews = () => {
    fetchNext().catch((e) => handleError(e))
  }

  if (error) {
    return (
      <h1 className={'grid h-screen  place-items-center text-4xl text-black'}>
        Something went wrong!
      </h1>
    )
  }

  if (isLoading) {
    return (
      <div className={'mt-14 flex h-[54px] items-center justify-center'}>
        <Loader />
      </div>
    )
  }

  return (
    <div
      className={twMerge(
        'relative ml-auto mr-auto max-w-[1157px]',
        reviews.length > 0 ? '' : 'xl:mb-20',
      )}
    >
      <div className="flex flex-col-reverse xl:flex-row">
        <h2 className="xl:4XL order-[1] mb-7 text-4XL font-medium text-primary xl:absolute xl:left-0 xl:top-0 xl:order-[0] ">
          Rating and reviews
        </h2>

        <div className="flex-1">
          {' '}
          {/* Left div */}
          <div>
            <div className="xl:max-w-[800px]">
              <ReviewForm productId={productId} />
              {(reviews.length > 0 || userReview) && (
                <>
                  <ReviewsSorter
                    selectedOption={selectedSortOption}
                    selectOption={selectSortOptionHandler}
                    userReview={userReview}
                  />
                  <ReviewsList
                    productId={productId}
                    reviews={reviews}
                    showMoreReviews={showMoreReviews}
                    isFetchingNextPage={isFetchingNextPage}
                    hasNextPage={hasNextPage}
                    userReview={userReview}
                  />
                </>
              )}
              {errorMessage && (
                <div className="mt-4 text-negative">{errorMessage}</div>
              )}
            </div>
          </div>
        </div>
        <div className="mr-auto">
          {' '}
          <div className="text-[18px] font-medium text-tertiary">
            {reviewsStatistics && reviewsStatistics.reviewsCount > 0 ? (
              <ReviewRatingFilter
                onChange={ratingFilterChangeHandler}
                selectedOptions={selectedFilterRating}
              />
            ) : (
              <div className="text-end">No customer reviews</div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default ReviewsSection
