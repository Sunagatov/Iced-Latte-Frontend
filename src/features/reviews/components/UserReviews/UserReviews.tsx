'use client'

import useSWR from 'swr'
import { apiGetUserReviews } from '@/features/reviews/api'
import Review from '@/features/reviews/components/Review/Review'
import Loader from '@/shared/components/Loader/Loader'
import Link from 'next/link'
import { RiStarLine } from 'react-icons/ri'

export default function UserReviews() {
  const { data: reviews, isLoading, error } = useSWR('/users/reviews', apiGetUserReviews)

  if (isLoading) return <div className="flex justify-center py-12"><Loader /></div>

  if (error) return (
    <p className="py-8 text-center text-sm text-negative">Failed to load reviews. Please try again.</p>
  )

  if (!reviews?.length) return (
    <div className="flex flex-col items-center gap-3 py-12 text-center">
      <RiStarLine className="h-10 w-10 text-disabled" />
      <p className="text-sm font-medium text-secondary">You haven't written any reviews yet.</p>
      <Link href="/" className="text-sm font-medium text-brand hover:underline">
        Browse products
      </Link>
    </div>
  )

  return (
    <ul className="flex flex-col gap-3">
      {reviews.map((review) => (
        <li
          key={review.productReviewId}
          className="rounded-2xl border border-primary/60 bg-white p-5 shadow-sm"
        >
          <div className="mb-3 text-xs font-medium text-secondary">
            Product ID: <Link href={`/product/${review.productId}`} className="text-brand hover:underline">{review.productId}</Link>
          </div>
          <Review isUserReview={false} review={review} />
        </li>
      ))}
    </ul>
  )
}
