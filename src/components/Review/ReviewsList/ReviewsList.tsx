'use client'

import Button from '@/components/UI/Buttons/Button/Button'
import ScrollUpBtn from '@/components/UI/Buttons/ScrollUpBtn/ScrollUpBtn'
import React from 'react'
import {
  apiDeleteProductReview,
  apiRateProductReview,
} from '@/services/reviewService'
import { useErrorHandler } from '@/services/apiError/apiError'
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
  onReviewDeleted?: (id: string) => void
  onReviewRated?: (updated: ReviewType) => void
}

const ReviewsList: React.FC<IReviewsList> = ({
  productId,
  reviews,
  hasNextPage,
  showMoreReviews,
  isFetchingNextPage,
  userReview,
  onReviewDeleted,
  onReviewRated,
}) => {
  const { token } = useAuthStore()
  const router = useRouter()
  const { handleError } = useErrorHandler()

  const deleteReviewHandler = async (productReviewId: string): Promise<void> => {
    try {
      productReviewId && (await apiDeleteProductReview(productReviewId, productId))
      onReviewDeleted?.(productReviewId)
    } catch (error) {
      handleError(error)
    }
  }

  const handleRateReview = async (productReviewId: string, isLike: boolean) => {
    try {
      if (!token) {
        router.push('/signin')
        return
      }
      const updated = await apiRateProductReview(productId, productReviewId, isLike)
      onReviewRated?.(updated)
    } catch (error) {
      handleError(error)
    }
  }

  return (
    <>
      {userReview && (
        <div className="mt-8 rounded-2xl border border-brand-solid/30 bg-brand-second/30 p-5">
          <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-brand-solid">Your review</div>
          <Review
            isUserReview
            review={userReview}
            deleteReview={deleteReviewHandler}
            rateReview={handleRateReview}
          />
        </div>
      )}

      <ul className="mt-6 flex flex-col gap-3">
        {reviews.map((review) => (
          <li
            className="rounded-2xl border border-primary/60 bg-white p-5 shadow-sm transition-shadow hover:shadow-md"
            key={review.productReviewId}
          >
            <Review
              isUserReview={false}
              review={review}
              rateReview={handleRateReview}
            />
          </li>
        ))}
        <ScrollUpBtn />
      </ul>

      {hasNextPage && !isFetchingNextPage && (
        <Button
          id="showmore-btn"
          onClick={showMoreReviews}
          className="mb-[94px] ml-auto mr-auto mt-6 flex w-[200px] items-center justify-center rounded-[47px] border-2 border-brand-solid bg-transparent text-[18px] font-semibold text-brand-solid shadow-sm hover:bg-brand-solid hover:text-white hover:shadow-md active:scale-95"
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
