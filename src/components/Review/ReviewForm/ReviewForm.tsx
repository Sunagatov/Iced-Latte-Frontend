'use client'
import StarRating from '@/components/Review/StarRating/StarRating'
import RatingInfo from '@/components/Review/RatingInfo/RatingInfo'
import Button from '@/components/UI/Buttons/Button/Button'
import { IoIosClose } from 'react-icons/io'
import { useState } from 'react'
import { useProductRatingStore } from '@/store/ratingStore'
import { useErrorHandler } from '@/services/apiError/apiError'
import { apiAddProductReview } from '@/services/reviewService'

interface ReviewFormProps {
  productId: string;
}

const ReviewForm = ({ productId }: ReviewFormProps) => {
  const [reviewText, setReviewText] = useState('')
  const [charCount, setCharCount] = useState(0)
  const { errorMessage, handleError } = useErrorHandler()
  const { ratings, setRating } = useProductRatingStore()
  const productRatingData = ratings[productId] || { id: productId, rating: 0 }
  const currentRating = productRatingData.rating

  const isReviewTextEmpty = reviewText.trim().length === 0

  const handleTextChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = event.target.value

    setReviewText(text)
    setCharCount(text.length)
  }

  const handleClearText = () => {
    setReviewText('')
    setCharCount(0)
  }

  const handleAddReview = async () => {
    try {
      const res = await apiAddProductReview(productId, reviewText)

      console.log(res)
    } catch (error) {
      handleError(error)
    }
  }

  const handleCancel = () => {
    setRating(productId, 0)
    handleClearText()
  }

  return (
    <>
      <div className='mt-[40px] mb-[40px] pb-[40px] border-b border-solid border-primary'>
        <div className='mb-[24px] font-medium text-[24px]'>Rating</div>
        <div className='flex items-center mb-6'>
          <StarRating productId={productId} count={5} activeColor={'#00A30E'} />
          <RatingInfo currentRating={currentRating} count={5} />
        </div>
      </div>
      <h3 className='mb-[24px] font-medium text-[24px] text-primary'>What do you think of this product?</h3>
      <div className='relative'>
        <textarea
          className={`text-[18px] w-full pl-[16px] pr-[46px] py-[17px] bg-secondary rounded-lg outline-focus ${reviewText ? 'h-[196px]' : 'h-[56px]'} ${reviewText ? 'pb-[39px]' : ''} placeholder:font-medium placeholder:text-sm `}
          value={reviewText}
          onChange={handleTextChange}
          placeholder='Share your impressions with other customers'
          maxLength={1500}
        ></textarea>
        {reviewText && (
          <>
            <div className='absolute bottom-2 right-4 text-tertiary'>{charCount}/1500</div>
            <button className='absolute top-4 right-4 text-tertiary' onClick={handleClearText}>
              <IoIosClose size={22} />
            </button>
          </>
        )}
      </div>
      {errorMessage && (
        <div className="mt-4 text-negative">
          {errorMessage}
        </div>
      )}
      <div className='mt-[40px]'>
        <Button onClick={handleAddReview} disabled={isReviewTextEmpty} className={`${isReviewTextEmpty ? 'opacity-20' : ''} w-[220px]`}>Add a review</Button>
        {reviewText && (<Button onClick={handleCancel} className='ml-2 w-[108px] bg-secondary text-primary font-medium text-[18px]'>Cancel</Button>)}
      </div>
    </>
  )
}

export default ReviewForm
