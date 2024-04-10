
'use client'
import ReviewRatingFilter from '@/components/Review/ReviewRatingFilter/ReviewRatingFilter'
import ReviewForm from '../ReviewForm/ReviewForm'
import CommentList from '../CommentsList/CommentsList'
import { useEffect, useState } from 'react'
import { useProductReviewsStore } from '@/store/reviewsStore'
import { useErrorHandler } from '@/services/apiError/apiError'
import isEqual from 'lodash/isEqual'
import { Review } from '@/types/ProductReviewType'
import { useUserReviewStatus } from '@/components/Review/ReviewComponent/useUserReviewStatus'
import { useLocalSessionStore } from '@/store/useLocalSessionStore'
interface ReviewComponentProps {
  productId: string;
}



const ReviewComponent = ({ productId }: ReviewComponentProps) => {
  const [comments, setComments] = useState<Review[]>([])
  const { errorMessage, handleError } = useErrorHandler()
  const productReviewsData = useProductReviewsStore()
  const { reviewsWithRatings, getProductReviews } = productReviewsData
  const { setIsReviewFormVisible, setIsReviewButtonVisible, setIsRaitingFormVisible } =
    useLocalSessionStore()

  const hasUserReviewed = useUserReviewStatus(productId)

  useEffect(() => {
    async function getProductReviewsById(productId: string): Promise<void> {
      try {
        await getProductReviews(productId)

        setIsReviewButtonVisible(true)
        setIsReviewFormVisible(false)
        setIsRaitingFormVisible(true)
      } catch (error) {
        handleError(error)
      }
    }

    void getProductReviewsById(productId)
  }, [
    productId,
    getProductReviews,
    handleError,
    setIsReviewButtonVisible,
    setIsReviewFormVisible,
    setIsRaitingFormVisible,
  ])

  useEffect(() => {
    if (!isEqual(reviewsWithRatings, comments)) {
      setComments(reviewsWithRatings)
    }
  }, [reviewsWithRatings, comments])

  const hasComments = comments.length > 0

  // function for processing the rating filter
  const handleRatingChange = (value: number | null) => {
    console.log(value)
  }

  return (
    <div className="relative ml-auto mr-auto max-w-[1157px]">
      <div className="flex flex-col-reverse xl:flex-row xl:justify-between">
        <h2 className="xl:4XL order-[1] mb-7 text-4XL font-medium text-primary xl:absolute xl:left-0 xl:top-0 xl:order-[0] ">
          Rating and reviews
        </h2>
        <div>
          <div className="xl:max-w-[800px]">
            {!hasUserReviewed && <ReviewForm productId={productId} />}
            {hasComments && <CommentList comments={comments} />}
            {errorMessage && (
              <div className="mt-4 text-negative">{errorMessage}</div>
            )}
          </div>
        </div>

        <div className="text-[18px] font-medium text-tertiary">
          {hasComments ? (
            <ReviewRatingFilter onChange={handleRatingChange} />
          ) : (
            <div className="text-end">No customer review</div>
          )}
        </div>
      </div>
    </div>
  )
}



export default ReviewComponent
