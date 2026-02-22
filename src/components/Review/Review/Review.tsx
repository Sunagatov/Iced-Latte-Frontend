'use client'

import React, { useState } from 'react'
import { BiDislike, BiLike } from 'react-icons/bi'
import { FaStar } from 'react-icons/fa'
import { Review as ReviewType } from '@/types/ReviewType'
import { formatReviewDate } from '@/components/Review/ReviewsList/formatReviewDate'
import { nanoid } from 'nanoid'
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

  const seeMoreButtonClickHandler = () => {
    setIsReviewExpanded(true)
  }

  const deleteReviewHandler = () => {
    deleteReview(review.productReviewId!)
  }

  const likeReviewHandler = () => {
    const isLike = true

    rateReview(review.productReviewId!, isLike)
  }

  const dislikeReviewHandler = () => {
    const isLike = false

    rateReview(review.productReviewId!, isLike)
  }

  if (!review) return <></>

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
            <span>{formatReviewDate(review.createdAt).date}</span>
            <span>·</span>
            <span>{formatReviewDate(review.createdAt).time}</span>
          </div>
        </div>
      </div>

      <div className="mb-3 flex items-center gap-1">
        {[...Array(5)].map((_, starValue) => (
          <FaStar
            className={`h-4 w-4 ${review.productRating && starValue < review.productRating ? 'text-brand' : 'text-disabled'}`}
            key={nanoid()}
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

      <div className="flex items-center justify-between">
        {isUserReview && (
          <button
            onClick={deleteReviewHandler}
            className="text-xs font-medium text-tertiary transition hover:text-negative"
          >
            Delete review
          </button>
        )}
        <div className="flex gap-2 xl:ml-auto">
          <button
            onClick={likeReviewHandler}
            className="flex items-center gap-1 text-xs text-tertiary transition hover:text-positive"
          >
            <BiLike className="h-3.5 w-3.5" />
            <span>{review.likesCount}</span>
          </button>
          <button
            onClick={dislikeReviewHandler}
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
