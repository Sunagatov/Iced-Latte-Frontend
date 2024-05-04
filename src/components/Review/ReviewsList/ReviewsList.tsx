'use client'

import Button from '@/components/UI/Buttons/Button/Button'
import ScrollUpBtn from '@/components/UI/Buttons/ScrollUpBtn/ScrollUpBtn'
import React from 'react'
import {
  apiDeleteProductReview,
  apiRateProductReview,
} from '@/services/reviewService'
import { useErrorHandler } from '@/services/apiError/apiError'
import { useProductReviewsStore } from '@/store/reviewsStore'
import { Review as ReviewType } from '@/types/ReviewType'
import Loader from '@/components/UI/Loader/Loader'
import Review from '@/components/Review/Review/Review'
import { useAuthStore } from '@/store/authStore'
import { useRouter } from 'next/navigation'

interface IReviewsList {
  productId: string
  reviews: ReviewType[]
  hasNextPage: boolean
  showMoreReviews: () => void
  isFetchingNextPage: boolean | undefined
  userReview: ReviewType | null
}

const ReviewsList: React.FC<IReviewsList> = ({
  productId,
  reviews,
  hasNextPage,
  showMoreReviews,
  isFetchingNextPage,
  userReview,
}) => {
  const { token, setModalState } = useAuthStore()
  const router = useRouter()

  const {
    setIsReviewFormVisible,
    setIsReviewButtonVisible,
    setIsRaitingFormVisible,
    setShouldRevalidateStatistics,
    setShouldRevalidateUserReview,
    setShouldRevalidateReviews,
  } = useProductReviewsStore()

  const {
    handleError,
    // errorMessage
  } = useErrorHandler()

  const deleteReviewHandler = async (
    productReviewId: string,
  ): Promise<void> => {
    try {
      productReviewId &&
        (await apiDeleteProductReview(productReviewId, productId))

      setShouldRevalidateStatistics(true)
      setShouldRevalidateReviews(true)
      setShouldRevalidateUserReview(true)

      setIsReviewFormVisible(false)
      setIsReviewButtonVisible(true)
      setIsRaitingFormVisible(false)
    } catch (error) {
      handleError(error)
    }
  }

  const handleRateComment = async (
    productReviewId: string,
    isLike: boolean,
  ) => {
    try {
      if (!token) {
        router.push('/auth/login')
        setModalState(true)

        return
      }
      await apiRateProductReview(productId, productReviewId, isLike)

      setShouldRevalidateReviews(true)
      setShouldRevalidateUserReview(true)
    } catch (error) {
      handleError(error)
    }
  }

  return (
    <>
      {userReview && (
        <div className="mt-10 xl:mt-20">
          <Review
            isUserReview
            review={userReview}
            deleteReview={deleteReviewHandler}
            rateReview={handleRateComment}
          />
        </div>
      )}

      <ul className="mt-10 flex flex-col gap-10 ">
        {reviews.map((review) => (
          <li className={`pb-6 xl:pb-10`} key={review.productReviewId}>
            <Review
              isUserReview={false}
              review={review}
              rateReview={handleRateComment}
            />
          </li>
        ))}
        <ScrollUpBtn />
      </ul>

      {hasNextPage && !isFetchingNextPage && (
        <Button
          id="showmore-btn"
          onClick={showMoreReviews}
          className="mb-[94px] ml-auto mr-auto mt-[24px] flex w-[334px] items-center justify-center rounded-[47px] bg-secondary text-[18px] font-medium text-primary"
        >
          Show more
        </Button>
      )}
      {isFetchingNextPage && (
        <div className={'mt-[24px] flex h-[54px] items-center'}>
          <Loader />
        </div>
      )}
    </>
  )
}

export default ReviewsList
