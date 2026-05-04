'use client'

import React, { useState } from 'react'
import { Review as ReviewType } from '@/features/reviews/types'
import { formatReviewDate } from '@/features/reviews/components/ReviewsList/formatReviewDate'
import { twMerge } from 'tailwind-merge'

const STAR_PATH =
  'M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z'

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
    [review.userName, review.userLastname].filter(Boolean).join(' ') ||
    'Anonymous'

  return (
    <article className="group">
      <div className="mb-3 flex items-center gap-3">
        <div className="bg-[#1B4332] text-white flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold">
          {displayName[0]?.toUpperCase() ?? '?'}
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-black/80">{displayName}</span>
            <span className="text-xs text-black/30">
              {date}{time && ` · ${time}`}
            </span>
          </div>
          <div
            className="mt-0.5 flex items-center gap-0.5"
            role="img"
            aria-label={
              (review.productRating as number | null)
                ? `Rated ${review.productRating as number} out of 5 stars`
                : 'No rating'
            }
          >
            {[...Array(5)].map((_, i) => (
              <svg key={i} className="h-3 w-3" viewBox="0 0 20 20" fill={review.productRating && i < review.productRating ? '#d97706' : 'rgba(0,0,0,0.1)'}>
                <path d={STAR_PATH} />
              </svg>
            ))}
          </div>
        </div>
      </div>

      <p
        className={twMerge(
          'text-sm leading-relaxed text-black/70',
          !review.text && 'text-black/30 italic',
        )}
      >
        {review.text ? (
          review.text.length > 300 && !isReviewExpanded ? (
            <span>
              {review.text.slice(0, 300)}
              <button
                onClick={() => setIsReviewExpanded(true)}
                className="text-[#1B4332] ml-1 text-sm font-medium hover:underline"
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
                  className="text-[#1B4332] ml-1 text-sm font-medium hover:underline"
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
        <p className="mt-3 rounded-lg bg-[#F0F7F4] px-3 py-2 text-xs text-black/50">
          <span className="font-semibold text-[#1B4332]">AI summary: </span>
          {review.aiSummary}
        </p>
      )}

      <div className="mt-3 flex items-center justify-between">
        {isUserReview && allowDelete && deleteReview && (
          <button
            className={`text-xs font-medium transition disabled:opacity-50 ${confirmDelete ? 'text-negative' : 'text-black/30 hover:text-negative'}`}
            disabled={isPending}
            onBlur={() => setConfirmDelete(false)}
            onClick={deleteReviewHandler}
          >
            {confirmDelete ? 'Confirm delete' : 'Delete review'}
          </button>
        )}
        {allowVoting && rateReview && (
          <div className="flex gap-3 xl:ml-auto">
            <button
              onClick={likeReviewHandler}
              disabled={isPending}
              aria-label={`Mark review as helpful, ${review.likesCount} likes`}
              className="text-black/30 hover:text-[#1B4332] flex items-center gap-1 text-xs transition disabled:opacity-50"
            >
              <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M14 9V5a3 3 0 00-3-3l-4 9v11h11.28a2 2 0 002-1.7l1.38-9a2 2 0 00-2-2.3H14z" /><path d="M7 22H4a2 2 0 01-2-2v-7a2 2 0 012-2h3" /></svg>
              <span>{review.likesCount}</span>
            </button>
            <button
              aria-label={`Mark review as not helpful, ${review.dislikesCount} dislikes`}
              className="text-black/30 hover:text-black/60 flex items-center gap-1 text-xs transition disabled:opacity-50"
              disabled={isPending}
              onClick={dislikeReviewHandler}
            >
              <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M10 15v4a3 3 0 003 3l4-9V2H5.72a2 2 0 00-2 1.7l-1.38 9a2 2 0 002 2.3H10z" /><path d="M17 2h2.67A2.31 2.31 0 0122 4v7a2.31 2.31 0 01-2.33 2H17" /></svg>
              <span>{review.dislikesCount}</span>
            </button>
          </div>
        )}
      </div>
    </article>
  )
}

export default Review
