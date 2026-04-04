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
  isPending?: boolean
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
    if (!confirmDelete) {
      setConfirmDelete(true)

      return
    }
    deleteReview(review.productReviewId as string)
  }

  const likeReviewHandler = () => {
    if (review.productReviewId && rateReview)
      rateReview(review.productReviewId as string, true)
  }

  const dislikeReviewHandler = () => {
    if (review.productReviewId && rateReview)
      rateReview(review.productReviewId as string, false)
  }

  const displayName =
    [review.userName, review.userLastName].filter(Boolean).join(' ') ||
    'Anonymous'

  return (
    <article className="group">
      <div className="mb-3 flex items-center gap-3">
        <div className="bg-brand-solid text-inverted flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold">
          {displayName[0]?.toUpperCase() ?? '?'}
        </div>
        <div>
          <div className="text-primary text-base font-semibold">
            {displayName}
          </div>
          <div className="text-tertiary flex items-center gap-1.5 text-sm">
            <span>{date}</span>
            {time && (
              <>
                <span>·</span>
                <span>{time}</span>
              </>
            )}
          </div>
        </div>
      </div>

      <div
        className="mb-3 flex items-center gap-1"
        role="img"
        aria-label={
          (review.productRating as number | null)
            ? `Rated ${review.productRating as number} out of 5 stars`
            : 'No rating'
        }
      >
        {[...Array(5)].map((_, i) => (
          <FaStar
            className={`h-4 w-4 ${review.productRating && i < review.productRating ? 'text-brand' : 'text-disabled'}`}
            key={i}
          />
        ))}
      </div>

      <p
        className={twMerge(
          'text-primary mb-4 text-sm leading-relaxed',
          !review.text && 'text-tertiary italic',
        )}
      >
        {review.text ? (
          review.text.length > 300 && !isReviewExpanded ? (
            <span>
              {review.text.slice(0, 300)}
              <button
                onClick={() => setIsReviewExpanded(true)}
                className="text-brand ml-1 text-sm font-medium hover:underline"
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
                  className="text-brand ml-1 text-sm font-medium hover:underline"
                >
                  Show less
                </button>
              )}
            </span>
          )
        ) : (
          'No written review'
        )}
      </p>

      {review.aiSummary && review.aiSummary !== 'Summary unavailable.' && (
        <p className="bg-brand-second/40 text-tertiary mb-4 rounded-lg px-3 py-2 text-xs">
          <span className="text-brand-solid font-semibold">AI summary: </span>
          {review.aiSummary}
        </p>
      )}

      <div className="flex items-center justify-between">
        {isUserReview && allowDelete && deleteReview && (
          <button
            className={`text-xs font-medium transition disabled:opacity-50 ${confirmDelete ? 'text-negative' : 'text-tertiary hover:text-negative'}`}
            disabled={isPending}
            onBlur={() => setConfirmDelete(false)}
            onClick={deleteReviewHandler}
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
              className="text-tertiary hover:text-positive flex items-center gap-1 text-xs transition disabled:opacity-50"
            >
              <BiLike className="h-3.5 w-3.5" />
              <span>{review.likesCount}</span>
            </button>
            <button
              aria-label={`Mark review as not helpful, ${review.dislikesCount} dislikes`}
              className="text-tertiary hover:text-negative flex items-center gap-1 text-xs transition disabled:opacity-50"
              disabled={isPending}
              onClick={dislikeReviewHandler}
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
