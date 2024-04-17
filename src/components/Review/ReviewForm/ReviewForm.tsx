'use client'
import StarRating from '@/components/Review/StarRating/StarRating'
import RatingInfo from '@/components/Review/RatingInfo/RatingInfo'
import Button from '@/components/UI/Buttons/Button/Button'
import Loader from '@/components/UI/Loader/Loader'
import { IoIosClose } from 'react-icons/io'
import { useState } from 'react'
import { useProductRatingStore } from '@/store/ratingStore'
import { useErrorHandler } from '@/services/apiError/apiError'
import { apiAddProductReview } from '@/services/reviewService'
import { useAuthStore } from '@/store/authStore'
import { useRouter } from 'next/navigation'
import { useMediaQuery } from 'usehooks-ts'
import { useProductReviewsStore } from '@/store/reviewsStore'
import { useUserReview } from '../ReviewComponent/useUserReview'

interface ReviewFormProps {
  productId: string;
}

const ReviewForm = ({ productId }: ReviewFormProps) => {
  const [loading, setLoading] = useState(false)
  const [reviewText, setReviewText] = useState('')
  const [charCount, setCharCount] = useState(0)
  const { errorMessage, handleError } = useErrorHandler()
  const { ratings, setRating } = useProductRatingStore()
  const { setIsReviewFormVisible, setIsReviewButtonVisible, setIsRaitingFormVisible } = useProductReviewsStore()
  const { token, setModalState } = useAuthStore()
  const ismediaQuery = useMediaQuery('(max-width: 768px)', { initializeWithValue: false })
  const router = useRouter()

  const isReviewFormVisible = useProductReviewsStore((state) => state.isReviewFormVisible)
  const isReviewButtonVisible = useProductReviewsStore((state) => state.isReviewButtonVisible)
  const isReviewRatingFormVisible = useProductReviewsStore((state) => state.isReviewRatingFormVisible)

  const productRatingData = ratings[productId] || { id: productId, rating: 0 }
  const currentRating = productRatingData.rating
  const isRatingSelected = currentRating > 0
  const isReviewTextEmpty = reviewText.trim().length === 0
  const isReviewButtonActive = isRatingSelected || !isReviewTextEmpty


  const handleTextChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = event.target.value

    setReviewText(text)
    setCharCount(text.length)
  }

  const handleClearText = () => {
    setReviewText('')
    setCharCount(0)
  }

  // If i just call this -  getProductReviews(productId) - get "An unknown error occurred"



  const handleAddReview = async () => {
    try {

      setLoading(true)
      await apiAddProductReview(productId, reviewText, currentRating)

      await useProductReviewsStore.getState().getProductReviews(productId)
      await useProductReviewsStore.getState().getProductUserReview(productId)


      setIsReviewFormVisible(false)
      setIsRaitingFormVisible(false)
      setIsReviewButtonVisible(false)

    } catch (error) {
      handleError(error)
    } finally {
      setLoading(false)
      setRating(productId, 0)
      handleClearText()
    }
  }

  const handleCancel = () => {
    setRating(productId, 0)
    handleClearText()

    setIsReviewFormVisible(false)
    setIsRaitingFormVisible(false)
    setIsReviewButtonVisible(true)
  }

  const handleClickReview = () => {
    if (token) {
      setIsReviewFormVisible(true)
      setIsRaitingFormVisible(true)
      setIsReviewButtonVisible(false)
    } else {
      router.push('/auth/login')
      setModalState(true)
    }
  }

  useUserReview(productId)



  return (

    <>
      {isReviewRatingFormVisible && (

        <div className='my-10 pb-8 border-b border-solid border-primary sm:pb-7 xl:pb-12 '>
          <div className='mb-6 font-medium text-2XL xl:mt-14'>Rating</div>
          <div className='flex items-center relative'>
            <StarRating productId={productId} count={5} activeColor={'#00A30E'} />
            <RatingInfo currentRating={currentRating} count={5} />
          </div>
          <h3 className='mb-6 font-medium text-2XL text-primary '>What do you think of this product?</h3>
        </div >)
      }

      {
        isReviewButtonVisible && (
          <Button onClick={handleClickReview} className='flex items-center justify-center font-medium text-[18px] text-inverted bg-focus rounded-[47px] sm:w-[278px] mb-10 mt-20 w-full'>Add a review</Button>
        )
      }

      {
        isReviewFormVisible && (
          <>
            <div className='relative'>
              <textarea
                className={`text-[18px] w-full pl-[16px] pr-[46px] py-[17px] bg-secondary rounded-lg outline-focus ${reviewText ? 'h-[196px]' : 'h-[56px]'} ${reviewText ? 'pb-[39px]' : ''} placeholder:font-medium placeholder:text-sm `}
                value={reviewText}
                onChange={handleTextChange}
                placeholder={ismediaQuery ? 'Share your impressions' : 'Share your impressions with other customers'}
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
            <div className='mt-6 flex gap-2 '>
              <Button onClick={handleAddReview} disabled={!isReviewButtonActive} className={`${!isReviewButtonActive ? 'opacity-20' : ''} w-[334px] flex items-center justify-center mb-12 xl:w-[278px]`}> {loading ? < Loader /> : 'Add a review'}</Button>
              {(reviewText || isRatingSelected) && (<Button onClick={handleCancel} className='ml-2 w-[108px] bg-secondary text-primary font-medium text-[18px]'>Cancel</Button>)}
            </div>

          </>
        )
      }
    </>
  )
}

export default ReviewForm
