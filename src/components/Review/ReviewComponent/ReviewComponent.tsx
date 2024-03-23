'use client'
import ReviewRatingFilter from '@/components/Review/ReviewRatingFilter/ReviewRatingFilter'
import ReviewForm from '../ReviewForm/ReviewForm'
import CommentList from '../CommentsList/CommentsList'
// import comments from '@/constants/coments'
import { Review } from '@/services/reviewService'
import { useEffect, useState } from 'react'
import { useProductReviewsStore } from '@/store/reviewsStore'
import { useErrorHandler } from '@/services/apiError/apiError'
interface ReviewComponentProps {
  productId: string;
}

const ReviewComponent = ({ productId }: ReviewComponentProps) => {
  const [comments, setComments] = useState<Review[]>([])
  const { errorMessage, handleError } = useErrorHandler()

  const productReviewsData = useProductReviewsStore()
  const { reviewsWithRatings, getProductReviews } = productReviewsData

  useEffect(() => {
    async function getProductReviewsById(id: string): Promise<void> {
      try {
        await getProductReviews(id)
        setComments(reviewsWithRatings)
      } catch (error) {
        handleError(error)
      }
    }

    void getProductReviewsById(productId)
  }, [productId, getProductReviews, setComments])

  const hasComments = comments.length > 0

  // function for processing the rating filter
  const handleRatingChange = (value: number | null) => {
    console.log(value)
  }

  return (
    <div className='max-w-[1157px] ml-auto mr-auto relative'>
      <div className='flex flex-col-reverse xl:flex-row xl:justify-between'>

        <h2 className='order-[1] font-medium text-3XL text-primary mb-7 xl:order-[0] xl:absolute xl:top-0 xl:left-0 xl:4XL'>Rating and reviews</h2>
        <div>
          <div className='xl:max-w-[800px]'>
            <ReviewForm productId={productId} />
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
    </div >
  )
}

export default ReviewComponent
