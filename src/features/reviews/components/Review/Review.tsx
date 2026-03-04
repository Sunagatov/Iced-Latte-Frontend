'use client'

import React, { useState } from 'react'
import { BiDislike, BiLike } from 'react-icons/bi'
import { FaStar } from 'react-icons/fa'
import { Review as ReviewType } from '@/features/reviews/types'
import { formatReviewDate } from '@/features/reviews/components/ReviewsList/formatReviewDate'
import { twMerge } from 'tailwind-merge'

interface IReview {
  isUserReview: boolean
  review: ReviewType
  deleteReview?: (id: string) => void
  rateReview?: (id: string, isLike: boolean) => void
}

const Review: React.FC<Readonly<IReview>> = ({
  isUserReview = false,
  review,
  deleteReview = () => {},
  rateReview = () => {},
}) => {
  const [isReviewExpanded, setIsReviewExpanded] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)

  if (!review) return <></>

  const { date, time } = formatReviewDate(review.createdAt)

  const seeMoreButtonClickHandler = () => {
    setIsReviewExpanded(true)
  }

  const deleteReviewHandler = () => {
    if (!confirmDelete) { setConfirmDelete(true)

      return }
    deleteReview(review.productReviewId!)
  }

  const likeReviewHandler = () => {
    rateReview(review.productReviewId!, true)
  }

  const dislikeReviewHandler = () => {
    rateReview(review.productReviewId!, false)
  }

  return (
    <article className="group">
      <div className="mb-3 flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-solid text-sm font-bold text-inverted">
          {review.userName?.[0]?.toUpperCase() ?? '?'}
        </div>
        <div>
          <div className="text-base font-semibold text-primary">
            {review.userName} {review.userLastName}
          </div>
          <div className="flex items-center gap-1.5 text-sm text-tertiary">
            <span>{date}</span>
            <span>·</span>
            <span>{time}</span>
          </div>
        </div>
      </div>

      <div className="mb-3 flex items-center gap-1" role="img" aria-label={`Rated ${review.productRating} out of 5 stars`}>
        {[...Array(5)].map((_, i) => (
          <FaStar
            className={`h-4 w-4 ${review.productRating && i < review.productRating ? 'text-brand' : 'text-disabled'}`}
            key={i}
          />
        ))}
      </div>

      <p
        className={twMerge(
          'mb-4 text-sm leading-relaxed text-primary',
          !review.text && 'italic text-tertiary',
        )}
      >
        {review.text ? (
          review.text.length > 300 && !isReviewExpanded ? (
            <span>
              {review.text.slice(0, 300)}
              <button
                onClick={seeMoreButtonClickHandler}
                className="ml-1 text-sm font-medium text-brand hover:underline"
              >
                see more
              </button>
            </span>
          ) : review.text
        ) : 'No written review'}
      </p>

      {review.aiSummary && review.aiSummary !== 'Summary unavailable.' && (
        <p className="mb-4 rounded-lg bg-brand-second/40 px-3 py-2 text-xs text-tertiary">
          <span className="font-semibold text-brand-solid">AI summary: </span>{review.aiSummary}
        </p>
      )}

      <div className="flex items-center justify-between">
        {isUserReview && (
          <button
            onClick={deleteReviewHandler}
            onBlur={() => setConfirmDelete(false)}
            className={`text-xs font-medium transition ${confirmDelete ? 'text-negative' : 'text-tertiary hover:text-negative'}`}
          >
            {confirmDelete ? 'Tap again to confirm' : 'Delete review'}
          </button>
        )}
        <div className="flex gap-2 xl:ml-auto">
          <button
            onClick={likeReviewHandler}
            aria-label={`Mark review as helpful, ${review.likesCount} likes`}
            className="flex items-center gap-1 text-xs text-tertiary transition hover:text-positive"
          >
            <BiLike className="h-3.5 w-3.5" />
            <span>{review.likesCount}</span>
          </button>
          <button
            onClick={dislikeReviewHandler}
            aria-label={`Mark review as not helpful, ${review.dislikesCount} dislikes`}
            className="flex items-center gap-1 text-xs text-tertiary transition hover:text-negative"
          >
            <BiDislike className="h-3.5 w-3.5" />
            <span>{review.dislikesCount}</span>
          </button>
        </div>
      </div>
    </article>
  )
}

export default Review
