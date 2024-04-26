import useSWRInfinite from 'swr/infinite'
import { apiGetAllReviews, IReviews } from '@/services/reviewService'
import {Review} from "@/types/ReviewType";
import {IOption} from "@/types/Dropdown";
import {IReviewsSortParams} from "@/types/IReviewsSortParams";

// export function useReviews(sortOption: IOption<IProductSortParams>) {

type UseReviewsParamsType = {
  productId: string
  userReview: Review | null
  sortOption: IOption<IReviewsSortParams>
  ratingFilter: number[]
}

export function useReviews({ productId, userReview, sortOption, ratingFilter }: UseReviewsParamsType) {
  const { sortAttribute, sortDirection } = sortOption.value

  const getKey = (pageIndex: number, previousData: IReviews) => {
    if (previousData && previousData.totalPages - 1 == previousData.page)
      return null

    const productRatingQuery = ratingFilter.length > 0 ? `&product_ratings=${ratingFilter.join(',')}` : ''

    return `/products/${productId}/reviews?page=${pageIndex}&size=3&sort_attribute=${sortAttribute}&sort_direction=${sortDirection}${productRatingQuery}`
  }

  const { data, error, isLoading, size, setSize } = useSWRInfinite<
    IReviews,
    Error
  >(getKey, apiGetAllReviews, {
    initialSize: 1,
  })

  const totalPages = data?.[0]?.totalPages ?? 0

  const fetchNext = () => setSize((size) => size + 1)
  const allLoadedReviews = data?.flatMap((page) => page.reviewsWithRatings) ?? []

  let filteredReviews

  if (userReview) {
    filteredReviews = allLoadedReviews
      .filter(review => review.productReviewId !== userReview.productReviewId)
  } else {
    filteredReviews = allLoadedReviews
  }

  const hasNextPage = size < totalPages

  const isFetchingNextPage =
    (isLoading && !error) || // initial loading
    (size > 0 && data && typeof data[size - 1] === 'undefined')

  return {
    data: filteredReviews,
    fetchNext,
    hasNextPage,
    isLoading,
    isFetchingNextPage,
    error,
  }
}
