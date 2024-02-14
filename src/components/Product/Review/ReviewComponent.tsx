'use client'
import StarRating from '@/components/UI/StarRating/StarRating'
import Button from '@/components/UI/Buttons/Button/Button'
import RatingInfo from '@/components/UI/RatingInfo/RatingInfo'
import { useState } from 'react'
import { IoIosClose } from 'react-icons/io'
import { useProductRatingStore } from '@/store/ratingStore'

interface ReviewComponentProps {
  productId: string;
}

const ReviewComponent = ({ productId }: ReviewComponentProps) => {
  const [reviewText, setReviewText] = useState('')
  const [charCount, setCharCount] = useState(0)
  const { ratings } = useProductRatingStore()

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

  return (
    <div>
      <h2>Rating and reviews</h2>
      <div className='mt-[40px] mb-[40px] pb-[40px] border-b border-solid border-[rgba(4, 18, 27, 0.24)]'>
        <div className='mb-[24px]'>Rating</div>
        <StarRating productId={productId} count={5} activeColor={'#00A30E'} />
        <RatingInfo currentRating={currentRating} count={5} />
      </div>
      <div>
        <h3 className='mb-[24px]'>What do you think of this product?</h3>
        <div className='relative'>
          <textarea
            className='w-full h-[200px] p-4 border border-solid border-[rgba(4, 18, 27, 0.24)]'
            value={reviewText}
            onChange={handleTextChange}
            placeholder='Share your impressions with other customers'
            maxLength={1500}
          ></textarea>
          {reviewText && (
            <>
              <div className='absolute bottom-2 right-2 text-gray-400'>{charCount}/1500</div>
              <button className='absolute top-2 right-2 text-gray-400' onClick={handleClearText}>
                <IoIosClose />
              </button>
            </>
          )}
        </div>
        <div className='mt-[40px]'>
          <Button disabled={isReviewTextEmpty}>Add a review</Button>
          {reviewText && (<Button onClick={handleClearText}>Cancel</Button>)}
        </div>
      </div>
    </div>
  )
}

export default ReviewComponent
