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

interface ReviewFormProps {
  productId: string
  showForm: boolean
  setShowForm: (v: boolean) => void
  onReviewSubmitted?: () => void
}

const ReviewForm = ({
  productId,
  showForm,
  setShowForm,
  onReviewSubmitted,
}: ReviewFormProps) => {
  const [loading, setLoading] = useState(false)
  const [reviewText, setReviewText] = useState('')
  const { errorMessage, handleError } = useErrorHandler()
  const { ratings, setRating } = useProductRatingStore()
  const isLoggedIn = useAuthStore((state) => state.status === 'authenticated')
  const router = useRouter()

  const currentRating = (ratings[productId] || { rating: 0 }).rating
  const canSubmit = currentRating > 0 && reviewText.trim().length > 0

  const handleAddReview = async () => {
    const trimmedText = reviewText.trim()

    if (!currentRating || !trimmedText) return

    try {
      setLoading(true)
      await apiAddProductReview(productId, trimmedText, currentRating)
      onReviewSubmitted?.()
      setRating(productId, 0)
      setReviewText('')
      setShowForm(false)
    } catch (error) {
      handleError(error)
    } finally {
      setLoading(false)
    }
  }

  const handleClickReview = () => {
    if (isLoggedIn) {
      setShowForm(true)
    } else {
      router.push(`/signin?next=/product/${productId}`)
    }
  }

  if (!showForm) {
    return (
      <div className="mb-6 flex items-center justify-between rounded-2xl border border-black/6 bg-white px-5 py-4 shadow-sm">
        <span className="text-sm font-medium text-slate-700">
          Share your thoughts
        </span>
        <button
          id="add-review-btn"
          onClick={handleClickReview}
          className="bg-brand text-inverted hover:bg-brand-solid-hover inline-flex items-center gap-1.5 rounded-xl px-4 py-2 text-sm font-semibold transition"
        >
          <RiEditLine className="h-3.5 w-3.5" />
          Write a review
        </button>
      </div>
    )
  }

  return (
    <div className="mt-2 mb-8 rounded-2xl border border-black/8 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-primary text-base font-semibold">Your review</h3>
        <button
          onClick={() => {
            setShowForm(false)
            setRating(productId, 0)
            setReviewText('')
          }}
          className="text-tertiary hover:text-primary text-xs transition"
        >
          Cancel
        </button>
      </div>

      <div className="mb-4">
        <p className="text-tertiary mb-2 text-xs font-medium tracking-wider uppercase">
          Rating
        </p>
        <StarRating
          productId={productId}
          count={5}
          activeColor="#682EFF"
          size="lg"
        />
      </div>

      <div>
        <p className="text-tertiary mb-2 text-xs font-medium tracking-wider uppercase">
          Review
        </p>
        <textarea
          id="review-textarea"
          className="bg-secondary text-primary focus:border-brand focus:ring-brand/20 placeholder:text-tertiary w-full resize-none rounded-xl border border-black/10 px-4 py-3 text-sm transition outline-none focus:ring-2"
          value={reviewText}
          onChange={(e) => setReviewText(e.target.value)}
          placeholder="What did you like or dislike? How was the taste, aroma, packaging?"
          maxLength={1500}
          rows={4}
        />
        <div className="text-tertiary mt-1 text-right text-xs">
          {reviewText.length}/1500
        </div>
      </div>

      {errorMessage && (
        <p className="text-negative mt-2 text-xs">{errorMessage}</p>
      )}

      <button
        id="submit-review-btn"
        onClick={handleAddReview}
        disabled={!canSubmit || loading}
        className={`text-inverted mt-4 flex w-full items-center justify-center rounded-xl py-3 text-sm font-semibold transition sm:w-auto sm:px-8 ${
          canSubmit && !loading
            ? 'bg-brand hover:bg-brand-solid-hover'
            : 'bg-tertiary text-disabled cursor-not-allowed'
        }`}
      >
        {loading ? <Loader /> : 'Submit review'}
      </button>
    </div>
  )
}

export default ReviewForm
