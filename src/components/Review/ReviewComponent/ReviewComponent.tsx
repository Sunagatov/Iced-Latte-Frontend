
'use client'
import ReviewRatingFilter from '@/components/Review/ReviewRatingFilter/ReviewRatingFilter'
import ReviewForm from '../ReviewForm/ReviewForm'
import CommentList from '../CommentsList/CommentsList'
import { apiCheckProductReview } from '@/services/reviewService'
import { useEffect, useState } from 'react'
import { useProductReviewsStore } from '@/store/reviewsStore'
import { useErrorHandler } from '@/services/apiError/apiError'
import _ from 'lodash'
import { Review } from '@/types/ProductReview'
interface ReviewComponentProps {
  productId: string;
}

const ReviewComponent = ({ productId }: ReviewComponentProps) => {
  const [comments, setComments] = useState<Review[]>([])
  const { errorMessage, handleError } = useErrorHandler()
  const productReviewsData = useProductReviewsStore()
  const { reviewsWithRatings, getProductReviews } = productReviewsData
  const [hasUserReviewed, setHasUserReviewed] = useState(false)

  useEffect(() => {
    async function getProductReviewsById(productId: string): Promise<void> {
      try {
        await getProductReviews(productId)
      } catch (error) {
        handleError(error)
      }
    }

    void getProductReviewsById(productId)
  }, [productId])

  useEffect(() => {
    if (!_.isEqual(reviewsWithRatings, comments)) {
      setComments(reviewsWithRatings)
    }
  }, [reviewsWithRatings, setComments])

  const hasComments = comments.length > 0

  // function for processing the rating filter
  const handleRatingChange = (value: number | null) => {
    console.log(value)
  }


  useEffect(() => {
    const checkUserReview = async () => {
      try {
        const response = await apiCheckProductReview(productId)

        if (response.reviewText && response.reviewText.trim().length > 0) {
          setHasUserReviewed(true)

        } else {
          setHasUserReviewed(false)
        }
      } catch (error) {
        console.error('Error checking user review status:', error)
        handleError(error)
      }
    }

    void checkUserReview()
  }, [productId])


  return (
    <div className='max-w-[1157px] ml-auto mr-auto relative'>
      <div className='flex flex-col-reverse xl:flex-row xl:justify-between'>

        <h2 className='order-[1] font-medium text-3XL text-primary mb-7 xl:order-[0] xl:absolute xl:top-0 xl:left-0 xl:4XL'>Rating and reviews</h2>
        <div>
          <div className='xl:max-w-[800px]'>
            {!hasUserReviewed && <ReviewForm productId={productId} />}
            {hasComments && < CommentList comments={comments} />}
            {errorMessage && (
              <div className="mt-4 text-negative">
                {errorMessage}
              </div>
            )}
          </div>
        </div>

        <div className='text-[18px] font-medium text-tertiary'>
          {hasComments ? <ReviewRatingFilter onChange={handleRatingChange} /> : <div className='text-end'>No customer review</div>}
        </div>

      </div>
    </div>
  )
}


export default ReviewComponent
