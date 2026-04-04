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
  allowVoting?: boolean
  allowDelete?: boolean
§  isPending?: boolean
  deleteReview?: (id: string) => void
  rateReview?: (id: string, isLike: boolean) => void
}

const Review: React.FC<Readonly<IReview>> = ({
  isUserReview = false,
  review,
  allowVoting = false,
  allowDelete = false,
  isPending = false,
  deleteReview,
  rateReview,
}) => {
  const [isReviewExpanded, setIsReviewExpanded] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)

  if (!review) return <></>

  const { date, time } = formatReviewDate(review.createdAt)

  const deleteReviewHandler = () => {
    if (!review.productReviewId || !deleteReview) return
    if (!confirmDelete) { setConfirmDelete(true)

      return }
    deleteReview(review.productReviewId)
  }

  const likeReviewHandler = () => {
    if (review.productReviewId && rateReview) rateReview(review.productReviewId, true)
  }

  const dislikeReviewHandler = () => {
    if (review.productReviewId && rateReview) rateReview(review.productReviewId, false)
  }

  const displayName = [review.userName, review.userLastName].filter(Boolean).join(' ') || 'Anonymous'

  return (
    <article className="group">
      <div className="mb-3 flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-solid text-sm font-bold text-inverted">
          {displayName[0]?.toUpperCase() ?? '?'}
        </div>
        <div>
          <div className="text-base font-semibold text-primary">{displayName}</div>
          <div className="flex items-center gap-1.5 text-sm text-tertiary">
            <span>{date}</span>
            {time && <><span>·</span><span>{time}</span></>}
          </div>
        </div>
      </div>

      <div className="mb-3 flex items-center gap-1" role="img" aria-label={review.productRating ? `Rated ${review.productRating} out of 5 stars` : 'No rating'}>
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
                onClick={() => setIsReviewExpanded(true)}
                className="ml-1 text-sm font-medium text-brand hover:underline"
              >
                Read more
              </button>
            </span>
          ) : (
            <span>
              {review.text}
              {review.text.length > 300 && (
                <button
                  onClick={() => setIsReviewExpanded(false)}
                  className="ml-1 text-sm font-medium text-brand hover:underline"
                >
                  Show less
                </button>
              )}
            </span>
          )
        ) : 'No written review'}
      </p>

      {review.aiSummary && review.aiSummary !== 'Summary unavailable.' && (
        <p className="mb-4 rounded-lg bg-brand-second/40 px-3 py-2 text-xs text-tertiary">
          <span className="font-semibold text-brand-solid">AI summary: </span>{review.aiSummary}
        </p>
      )}

      <div className="flex items-center justify-between">
        {isUserReview && allowDelete && deleteReview && (
          <button
            onClick={deleteReviewHandler}
            onBlur={() => setConfirmDelete(false)}
            disabled={isPending}
            className={`text-xs font-medium transition disabled:opacity-50 ${confirmDelete ? 'text-negative' : 'text-tertiary hover:text-negative'}`}
          >
            {confirmDelete ? 'Confirm delete' : 'Delete review'}
          </button>
        )}
        {allowVoting && rateReview && (
          <div className="flex gap-2 xl:ml-auto">
            <button
              onClick={likeReviewHandler}
              disabled={isPending}
              aria-label={`Mark review as helpful, ${review.likesCount} likes`}
              className="flex items-center gap-1 text-xs text-tertiary transition hover:text-positive disabled:opacity-50"
            >
              <BiLike className="h-3.5 w-3.5" />
              <span>{review.likesCount}</span>
            </button>
            <button
              onClick={dislikeReviewHandler}
              disabled={isPending}
              aria-label={`Mark review as not helpful, ${review.dislikesCount} dislikes`}
              className="flex items-center gap-1 text-xs text-tertiary transition hover:text-negative disabled:opacity-50"
            >
              <BiDislike className="h-3.5 w-3.5" />
              <span>{review.dislikesCount}</span>
            </button>
          </div>
        )}
      </div>
    </article>
  )
}

export default Review
