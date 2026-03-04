import useSWRInfinite from 'swr/infinite'
import { useCallback } from 'react'
import { apiGetAllReviews, IReviews } from './api'
import { Review } from './types'
import { IOption } from '@/shared/types/Dropdown'
import { ISortParams } from '@/shared/types/ISortParams'

type UseReviewsParamsType = {
  productId: string
  userReview: Review | null
  sortOption: IOption<ISortParams>
  ratingFilter: number[]
}

export function useReviews({ productId, userReview, sortOption, ratingFilter }: UseReviewsParamsType) {
  const { sortAttribute, sortDirection } = sortOption.value

  const getKey = (pageIndex: number, previousData: IReviews) => {
    if (previousData && previousData.totalPages - 1 == previousData.page) return null
    const productRatingQuery = ratingFilter.length > 0 ? `&productRatings=${ratingFilter.join(',')}` : ''
    return `/products/${productId}/reviews?page=${pageIndex}&size=3&sortAttribute=${sortAttribute}&sortDirection=${sortDirection}${productRatingQuery}`
  }

  const { data, error, isLoading, size, setSize, mutate } = useSWRInfinite<IReviews, Error>(
    getKey,
    apiGetAllReviews,
    { initialSize: 1, revalidateFirstPage: false },
  )

  const totalPages = data?.[0]?.totalPages ?? 0
  const fetchNext = () => setSize((size) => size + 1)
  const allLoadedReviews = data?.flatMap((page) => page.reviewsWithRatings) ?? []
  const seen = new Set<string>()
  const dedupedReviews = allLoadedReviews.filter((r) => {
    if (!r.productReviewId || seen.has(r.productReviewId)) return false
    seen.add(r.productReviewId)
    return true
  })
  const filteredReviews = userReview
    ? dedupedReviews.filter((review) => review.productReviewId !== userReview.productReviewId)
    : dedupedReviews

  const refreshReviews = useCallback(() => mutate(), [mutate])

  const removeReviewFromCache = useCallback(
    (productReviewId: string) => {
      mutate(
        (pages) =>
          pages?.map((page) => ({
            ...page,
            reviewsWithRatings: page.reviewsWithRatings.filter((r) => r.productReviewId !== productReviewId),
          })),
        { revalidate: false },
      )
    },
    [mutate],
  )

  const addReviewToCache = useCallback(
    (review: Review) => {
      mutate(
        (pages) => {
          if (!pages) return pages
          const first = pages[0]
          return [{ ...first, reviewsWithRatings: [review, ...first.reviewsWithRatings] }, ...pages.slice(1)]
        },
        { revalidate: true },
      )
    },
    [mutate],
  )

  const updateReviewInCache = useCallback(
    (updated: Review) => {
      mutate(
        (pages) =>
          pages?.map((page) => ({
            ...page,
            reviewsWithRatings: page.reviewsWithRatings.map((r) =>
              r.productReviewId === updated.productReviewId ? updated : r,
            ),
          })),
        { revalidate: false },
      )
    },
    [mutate],
  )

  return {
    data: filteredReviews,
    fetchNext,
    hasNextPage: size < totalPages,
    isLoading,
    isFetchingNextPage: (isLoading && !error) || (size > 0 && data && typeof data[size - 1] === 'undefined'),
    error,
    refreshReviews,
    removeReviewFromCache,
    addReviewToCache,
    updateReviewInCache,
  }
}
