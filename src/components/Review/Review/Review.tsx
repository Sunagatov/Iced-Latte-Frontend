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
    <>
      <div className="mb-2 text-XL font-medium text-primary xl:text-2XL">
        <span>
          {review.userName} {review.userLastName}
        </span>
      </div>
      <div className="mb-6 flex items-center text-[18px] font-medium text-primary">
        <div className="flex items-center gap-1">
          {[...Array(5)].map((_, starValue) => (
            <FaStar
              className={`h-[18px] w-[18px] ${review.productRating && starValue < review.productRating ? 'text-positive' : 'text-disabled'} xl:h-6 xl:w-6`}
              key={nanoid()}
            />
          ))}
          <span className="ml-2 text-L font-medium text-primary">
            {review.productRating ?? 0}
          </span>
        </div>
        <div className="inline-flex text-L font-medium text-tertiary">
          <div className="relative ml-3 inline-flex">
            <span className="ml-[10px] text-L">
              {formatReviewDate(review.createdAt).date}
            </span>
            <div className="absolute left-0 top-1/2 h-[5px] w-[5px] -translate-x-1/2 -translate-y-1/2 transform rounded-full bg-gray-400 text-tertiary"></div>
          </div>
          <span className="ml-2">
            {formatReviewDate(review.createdAt).time}
          </span>
        </div>
      </div>

      <p
        className={twMerge(
          'mb-6 rounded-[8px] bg-brand-second px-4 py-[17px] text-L',
          `${isUserReview ? 'bg-brand-second' : 'bg-secondary'}`,
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
                  className="inline-flex h-auto bg-transparent pl-0 text-L font-medium text-tertiary"
                >
                  ...see more
                </Button>
              </span>
            ) : (
              review.text
            )}
          </>
        ) : (
          'No review'
        )}
      </p>

      <div className="flex items-center justify-between">
        {isUserReview && (
          <Button
            id="delete-review-btn"
            onClick={deleteReviewHandler}
            className="mr-auto w-[126px] rounded-[47px] bg-secondary px-6 py-4 text-L font-medium text-primary hover:bg-tertiary md:w-[196px]"
          >
            {isMediaQuery ? 'Delete my review' : 'Delete'}
          </Button>
        )}
        <div className="flex gap-2 xl:ml-auto">
          <Button
            id={`like-btn-${review.productReviewId}`}
            onClick={likeReviewHandler}
            className="flex w-[88px] items-center justify-center gap-2 rounded-[47px] bg-secondary font-medium text-tertiary hover:bg-tertiary"
          >
            <BiLike />
            <span>{review.likesCount}</span>
          </Button>
          <Button
            id={`dislike-btn-${review.productReviewId}`}
            onClick={dislikeReviewHandler}
            className="flex w-[88px] items-center justify-center gap-2 rounded-[47px] bg-secondary font-medium text-tertiary hover:bg-tertiary"
          >
            <BiDislike />
            <span>{review.dislikesCount}</span>
          </Button>
        </div>
      </div>
    </>
  )
}

export default Review
