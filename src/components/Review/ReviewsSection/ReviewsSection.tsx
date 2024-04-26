'use client'
import ReviewRatingFilter from '@/components/Review/ReviewRatingFilter/ReviewRatingFilter'
import ReviewForm from '../ReviewForm/ReviewForm'
import React, {useEffect, useState} from 'react'
import {
  useProductReviewsStore,
} from '@/store/reviewsStore'
import { useErrorHandler } from '@/services/apiError/apiError'
import { Review } from '@/types/ReviewType'
import { useAuthStore } from '@/store/authStore'
import {useReviews} from "@/hooks/useReviews";
import {apiGetProductUserReview} from "@/services/reviewService";
import Loader from "@/components/UI/Loader/Loader";
import ReviewsList from "@/components/Review/ReviewsList/ReviewsList";

interface ReviewComponentProps {
  productId: string
}

const ReviewsSection = ({ productId }: ReviewComponentProps) => {
  const { errorMessage, handleError } = useErrorHandler()
  const { token } = useAuthStore()
  const [userReview, setUserReview] = useState<Review | null>(null)

  useEffect(() => {
    const getUserReview = async (productId: string) => {
      try {
        const userReview = await apiGetProductUserReview(productId, token)

        setUserReview(userReview)
      } catch (error) {
        handleError(error)
      }
    }

    if (token) {
      void getUserReview(productId)
    }
  }, [token, productId, setUserReview, handleError])


  const handleRatingChange = (value: number | null) => {
    console.log(value)
  }

  const {
    data,
    fetchNext,
    hasNextPage,
    isLoading,
    isFetchingNextPage,
    error
  } = useReviews({ productId, userReview })

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
    <div className="relative ml-auto mr-auto max-w-[1157px]">
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
              {data.length > 0 && (
                <ReviewsList
                  productId={productId}
                  reviews={data}
                  showMoreReviews={showMoreReviews}
                  isFetchingNextPage={isFetchingNextPage}
                  hasNextPage={hasNextPage}
                  userReview={userReview}
                />
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
            {data.length > 0 ? (
              <ReviewRatingFilter onChange={handleRatingChange} />
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
