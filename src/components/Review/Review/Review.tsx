'use client'

import React, { useState } from 'react'
import { useMediaQuery } from 'usehooks-ts'
import { BiDislike, BiLike } from 'react-icons/bi'
import { FaStar } from 'react-icons/fa'
import { Review as ReviewType } from '@/types/ReviewType'
import { formatReviewDate } from '@/components/Review/ReviewsList/formatReviewDate'
import Button from '@/components/UI/Buttons/Button/Button'
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
  const isMediaQuery = useMediaQuery('(min-width: 768px)', {
    initializeWithValue: false,
  })

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
            className={`h-4 w-4 ${review.productRating && starValue < review.productRating ? 'text-positive' : 'text-disabled'}`}
            key={nanoid()}
          />
        ))}
        <span className="ml-1 text-sm font-semibold text-primary">{review.productRating ?? 0}</span>
      </div>

      <div
        className={twMerge(
          'mb-4 rounded-2xl px-5 py-4 text-base leading-relaxed text-primary',
          isUserReview ? 'bg-brand-second ring-1 ring-brand-solid/20' : 'bg-secondary',
        )}
      >
        {review.text ? (
          <>
            {review.text.length > 300 && !isReviewExpanded ? (
              <span>
                {review.text.slice(0, 300)}
                <Button
                  id="see-more-btn"
                  onClick={seeMoreButtonClickHandler}
                  className="inline-flex h-auto bg-transparent pl-1 text-sm font-medium text-brand-solid"
                >
                  see more
                </Button>
              </span>
            ) : (
              review.text
            )}
          </>
        ) : (
          <span className="text-tertiary italic">No written review</span>
        )}
      </div>

      <div className="flex items-center justify-between">
        {isUserReview && (
          <Button
            id="delete-review-btn"
            onClick={deleteReviewHandler}
            className="mr-auto rounded-full bg-secondary px-5 py-2 text-sm font-medium text-primary hover:bg-red-50 hover:text-red-600 md:w-auto"
          >
            {isMediaQuery ? 'Delete' : 'Delete my review'}
          </Button>
        )}
        <div className="flex gap-2 xl:ml-auto">
          <button
            onClick={likeReviewHandler}
            className="flex items-center gap-1.5 rounded-full bg-secondary px-4 py-2 text-sm font-medium text-tertiary transition-all duration-150 hover:bg-green-50 hover:text-green-700 active:scale-95"
          >
            <BiLike className="h-4 w-4" />
            <span>{review.likesCount}</span>
          </button>
          <button
            onClick={dislikeReviewHandler}
            className="flex items-center gap-1.5 rounded-full bg-secondary px-4 py-2 text-sm font-medium text-tertiary transition-all duration-150 hover:bg-red-50 hover:text-red-600 active:scale-95"
          >
            <BiDislike className="h-4 w-4" />
            <span>{review.dislikesCount}</span>
          </button>
        </div>
      </div>
    </article>
  )
}

export default Review
