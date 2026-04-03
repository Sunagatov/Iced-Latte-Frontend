'use client'
import StarRating from '@/features/reviews/components/StarRating/StarRating'
import Loader from '@/shared/components/Loader/Loader'
import { useState } from 'react'
import { useProductRatingStore } from '@/features/reviews/store'
import { useErrorHandler } from '@/shared/utils/apiError'
import { apiAddProductReview } from '@/features/reviews/api'
import { useAuthStore } from '@/features/auth/store'
import { useRouter } from 'next/navigation'
import { RiEditLine } from 'react-icons/ri'
import { Review } from '@/features/reviews/types'

interface ReviewFormProps {
  productId: string
  hasReviews?: boolean
  showForm: boolean
  setShowForm: (v: boolean) => void
  onReviewSubmitted?: (review: Review) => void
}

const ReviewForm = ({ productId, showForm, setShowForm, onReviewSubmitted }: ReviewFormProps) => {
  const [loading, setLoading] = useState(false)
  const [reviewText, setReviewText] = useState('')
  const { errorMessage, handleError } = useErrorHandler()
  const { ratings, setRating } = useProductRatingStore()
  const { token, userData } = useAuthStore()
  const router = useRouter()

  const currentRating = (ratings[productId] || { rating: 0 }).rating
  const canSubmit = currentRating > 0 && reviewText.trim().length > 0

  const handleAddReview = async () => {
    try {
      setLoading(true)
      const submitted = await apiAddProductReview(productId, reviewText, currentRating)
      const newReview: Review = {
        productReviewId: submitted.productReviewId,
        productId,
        text: submitted.text,
        createdAt: submitted.createdAt,
        productRating: currentRating,
        userName: userData?.firstName ?? '',
        userLastName: userData?.lastName ?? '',
        likesCount: 0,
        dislikesCount: 0,
        isCurrentUserComment: true,
      }

      onReviewSubmitted?.(newReview)
      // Re-fetch after delay to reflect async moderation outcome
      setTimeout(() => onReviewSubmitted?.(newReview), 5000)
    } catch (error) {
      handleError(error)
    } finally {
      setLoading(false)
      setRating(productId, 0)
      setReviewText('')
    }
  }

  const handleClickReview = () => {
    if (!token) {
      // If store hasn't hydrated yet, check persist directly
      const storeToken = useAuthStore.getState().token
      if (storeToken) {
        setShowForm(true)
        return
      }
      router.push('/signin')
      return
    }
    setShowForm(true)
  }

  if (!showForm) {
    return (
      <div className="mb-6 flex items-center justify-between rounded-2xl border border-black/6 bg-white px-5 py-4 shadow-sm">
        <span className="text-sm font-medium text-slate-700">Share your thoughts</span>
        <button
          id="add-review-btn"
          onClick={handleClickReview}
          className="inline-flex items-center gap-1.5 rounded-xl bg-brand px-4 py-2 text-sm font-semibold text-inverted transition hover:bg-brand-solid-hover"
        >
          <RiEditLine className="h-3.5 w-3.5" />
          Write a review
        </button>
      </div>
    )
  }

  return (
    <div className="mb-8 mt-2 rounded-2xl border border-black/8 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-base font-semibold text-primary">Your review</h3>
        <button
          onClick={() => { setShowForm(false); setRating(productId, 0); setReviewText('') }}
          className="text-xs text-tertiary hover:text-primary transition"
        >
          Cancel
        </button>
      </div>

      <div className="mb-4">
        <p className="mb-2 text-xs font-medium uppercase tracking-wider text-tertiary">Rating</p>
        <StarRating productId={productId} count={5} activeColor="#682EFF" size="lg" />
      </div>

      <div>
        <p className="mb-2 text-xs font-medium uppercase tracking-wider text-tertiary">Review</p>
        <textarea
          id="review-textarea"
          className="w-full resize-none rounded-xl border border-black/10 bg-secondary px-4 py-3 text-sm text-primary outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/20 placeholder:text-tertiary"
          value={reviewText}
          onChange={(e) => setReviewText(e.target.value)}
          placeholder="What did you like or dislike? How was the taste, aroma, packaging?"
          maxLength={1500}
          rows={4}
        />
        <div className="mt-1 text-right text-xs text-tertiary">{reviewText.length}/1500</div>
      </div>

      {errorMessage && <p className="mt-2 text-xs text-negative">{errorMessage}</p>}

      <button
        id="submit-review-btn"
        onClick={handleAddReview}
        disabled={!canSubmit || loading}
        className={`mt-4 flex w-full items-center justify-center rounded-xl py-3 text-sm font-semibold text-inverted transition sm:w-auto sm:px-8 ${
          canSubmit && !loading ? 'bg-brand hover:bg-brand-solid-hover' : 'cursor-not-allowed bg-tertiary text-disabled'
        }`}
      >
        {loading ? <Loader /> : 'Submit review'}
      </button>
    </div>
  )
}

export default ReviewForm
