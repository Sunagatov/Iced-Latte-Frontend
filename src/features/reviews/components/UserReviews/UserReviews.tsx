'use client'

import useSWR from 'swr'
import { apiGetUserReviews } from '@/features/reviews/api'
import Review from '@/features/reviews/components/Review/Review'
import Loader from '@/shared/components/Loader/Loader'
import Link from 'next/link'
import { RiStarLine } from 'react-icons/ri'

export default function UserReviews() {
  const {
    data: reviews,
    isLoading,
    error,
  } = useSWR('/users/reviews', apiGetUserReviews)

  if (isLoading)
    return (
      <div className="flex justify-center py-12">
        <Loader />
      </div>
    )

  if (error)
    return (
      <p className="text-negative py-8 text-center text-sm">
        Failed to load reviews. Please try again.
      </p>
    )

  if (!reviews?.length)
    return (
      <div className="flex flex-col items-center gap-3 py-12 text-center">
        <RiStarLine className="text-disabled h-10 w-10" />
        <p className="text-secondary text-sm font-medium">
          You haven&apos;t written any reviews yet.
        </p>
        <Link
          href="/"
          className="text-brand text-sm font-medium hover:underline"
        >
          Browse products
        </Link>
      </div>
    )

  return (
    <ul className="flex flex-col gap-3">
      {reviews.map((review) => (
        <li
          key={review.productReviewId}
          className="border-primary/60 rounded-2xl border bg-white p-5 shadow-sm"
        >
          <div className="mb-3">
            <Link
              href={`/product/${review.productId}`}
              className="text-brand text-xs font-medium hover:underline"
            >
              View product →
            </Link>
          </div>
          <Review
            isUserReview={false}
            review={review}
            allowVoting={false}
            allowDelete={false}
          />
        </li>
      ))}
    </ul>
  )
}
