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

interface ReviewFormProps {
  productId: string
}

const ReviewForm = ({ productId }: ReviewFormProps) => {
  const [loading, setLoading] = useState(false)
  const [reviewText, setReviewText] = useState('')
  const [charCount, setCharCount] = useState(0)
  const { errorMessage, handleError } = useErrorHandler()
  const { ratings, setRating } = useProductRatingStore()
  const {
    setIsReviewFormVisible,
    setIsReviewButtonVisible,
    setIsRaitingFormVisible,
    setShouldRevalidateStatistics,
    setShouldRevalidateUserReview,
    setShouldRevalidateReviews,
  } = useProductReviewsStore()
  const { token } = useAuthStore()
  const ismediaQuery = useMediaQuery('(max-width: 768px)', {
    initializeWithValue: false,
  })
  const router = useRouter()

  const isReviewFormVisible = useProductReviewsStore(
    (state) => state.isReviewFormVisible,
  )
  const isReviewButtonVisible = useProductReviewsStore(
    (state) => state.isReviewButtonVisible,
  )
  const isReviewRatingFormVisible = useProductReviewsStore(
    (state) => state.isReviewRatingFormVisible,
  )

  const productRatingData = ratings[productId] || { id: productId, rating: 0 }
  const currentRating = productRatingData.rating
  const isRatingSelected = currentRating > 0
  const isReviewTextEmpty = reviewText.trim().length === 0
  // const isReviewButtonActive = isRatingSelected || !isReviewTextEmpty

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
      setLoading(true)
      await apiAddProductReview(productId, reviewText, currentRating)

      setShouldRevalidateStatistics(true)
      setShouldRevalidateReviews(true)
      setShouldRevalidateUserReview(true)

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
      router.push('/signin')
    }
  }

  return (
    <>
      {isReviewRatingFormVisible && (
        <div className="my-10 border-b border-solid border-primary pb-8 sm:pb-7 xl:pb-12 ">
          <div className="mb-6 text-2XL font-medium xl:mt-14">Rating</div>
          <div className="relative flex items-center">
            <StarRating
              productId={productId}
              count={5}
              activeColor={'#00A30E'}
            />
            <RatingInfo currentRating={currentRating} />
          </div>
        </div>
      )}

      {isReviewButtonVisible && (
        <Button
          id="add-review-btn"
          onClick={handleClickReview}
          className="mb-8 mt-10 flex w-full items-center justify-center rounded-2xl bg-brand-solid text-base font-semibold text-inverted shadow-md hover:brightness-110 hover:shadow-lg sm:w-[240px]"
        >
          + Add a review
        </Button>
      )}

      {isReviewFormVisible && (
        <>
          <div className="relative">
            <h3 className="mb-4 text-xl font-semibold text-primary">
              What do you think of this product?
            </h3>
            <textarea
              id="review-textarea"
              className={`w-full rounded-2xl border border-primary/40 bg-secondary px-4 py-3 text-base outline-none transition-all focus:border-brand-solid focus:ring-2 focus:ring-brand-solid/20 ${reviewText ? 'h-[160px]' : 'h-[52px]'} ${reviewText ? 'pb-8' : ''} placeholder:text-sm placeholder:text-tertiary`}
              value={reviewText}
              onChange={handleTextChange}
              placeholder={
                ismediaQuery
                  ? 'Share your impressions'
                  : 'Share your impressions with other customers'
              }
              maxLength={1500}
            />
            {reviewText && (
              <>
                <div className="absolute bottom-2 right-4 text-xs text-tertiary">
                  {charCount}/1500
                </div>
                <button
                  className="absolute right-4 top-3 text-tertiary hover:text-primary"
                  onClick={handleClearText}
                >
                  <IoIosClose size={20} />
                </button>
              </>
            )}
          </div>

          {errorMessage && (
            <div className="mt-4 text-negative">{errorMessage}</div>
          )}
          <div className="mt-4 flex gap-2">
            <Button
              id="submit-review-btn"
              onClick={handleAddReview}
              disabled={!isRatingSelected || isReviewTextEmpty}
              className={`${!isRatingSelected || isReviewTextEmpty ? 'opacity-30' : ''} mb-10 flex w-full items-center justify-center rounded-2xl font-semibold sm:w-[240px]`}
            >
              {loading ? <Loader /> : 'Submit review'}
            </Button>
            {(reviewText || isRatingSelected) && (
              <Button
                id="submit-cancel-btn"
                onClick={handleCancel}
                className="w-[100px] rounded-2xl bg-secondary text-base font-medium text-primary hover:bg-tertiary"
              >
                Cancel
              </Button>
            )}
          </div>
        </>
      )}
    </>
  )
}

export default ReviewForm
