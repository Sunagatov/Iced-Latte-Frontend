'use client'

import ScrollUpBtn from '@/shared/ui/ScrollUpButton'
import React from 'react'
import {
  apiDeleteProductReview,
  apiRateProductReview,
} from '@/features/reviews/api'
import { useToastErrorHandler } from '@/shared/utils/apiError'
import { Review as ReviewType } from '@/features/reviews/types'
import Loader from '@/shared/ui/Loader'
import Review from '@/features/reviews/components/Review'
import { useAuthStore } from '@/features/auth/store'
import { useRouter } from 'next/navigation'
import { ROUTES } from '@/shared/config/routes'

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
  const isLoggedIn: boolean = useAuthStore((s) => s.isLoggedIn)
  const router = useRouter()
  const { handleError } = useToastErrorHandler()
  const [isPending, setIsPending] = React.useState(false)

  const deleteReviewHandler = async (
    productReviewId: string,
  ): Promise<void> => {
    if (isPending) return
    setIsPending(true)
    try {
      if (productReviewId)
        await apiDeleteProductReview(productReviewId, productId)
      onReviewDeleted?.(productReviewId)
    } catch (error) {
      handleError(error)
    } finally {
      setIsPending(false)
    }
  }

  const handleRateReview = async (productReviewId: string, isLike: boolean) => {
    if (isPending) return
    setIsPending(true)
    try {
      if (!isLoggedIn) {
        router.push(ROUTES.signin)

        return
      }
      const updated = await apiRateProductReview(
        productId,
        productReviewId,
        isLike,
      )

      onReviewRated?.(updated)
    } catch (error) {
      handleError(error)
    } finally {
      setIsPending(false)
    }
  }

  return (
    <>
      {userReview && (
        <div className="border-brand-solid/30 bg-brand-second/30 mt-8 rounded-2xl border p-5">
          <div className="text-brand-solid mb-2 text-xs font-semibold tracking-wider uppercase">
            Your review
          </div>
          <Review
            allowDelete
            allowVoting={false}
            deleteReview={deleteReviewHandler}
            isPending={isPending}
            isUserReview
            review={userReview}
          />
        </div>
      )}

      <ul className="mt-6 flex flex-col gap-4">
        {reviews.map((review) => (
          <li
            className="rounded-2xl border border-black/6 bg-white p-5 shadow-sm transition-shadow hover:shadow-md"
            key={review.productReviewId}
          >
            <Review
              allowVoting
              isPending={isPending}
              isUserReview={false}
              rateReview={handleRateReview}
              review={review}
            />
          </li>
        ))}
        <ScrollUpBtn />
      </ul>

      {hasNextPage && !isFetchingNextPage && (
        <div className="mt-8 flex justify-center">
          <button
            id="showmore-btn"
            onClick={showMoreReviews}
            className="rounded-full border border-black/10 bg-white px-8 py-2.5 text-sm font-medium text-black/60 shadow-sm transition hover:border-black/20 hover:text-black/80 active:scale-[0.98]"
          >
            Show more reviews
          </button>
        </div>
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
