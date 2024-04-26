import useSWRInfinite from 'swr/infinite'
// import { IOption } from '@/types/Dropdown'
import { apiGetAllReviews, IReviews } from '@/services/reviewService'
import {Review} from "@/types/ReviewType";

// export function useReviews(sortOption: IOption<IProductSortParams>) {

type UseReviewsParamsType = {
  productId: string
  userReview: Review | null
}

export function useReviews({ productId, userReview }: UseReviewsParamsType) {
  // const { sortAttribute, sortDirection } = sortOption.value

  const getKey = (pageIndex: number, previousData: IReviews) => {
    if (previousData && previousData.totalPages - 1 == previousData.page)
      return null

    // return `products?page=${pageIndex}&size=6&sort_attribute=${sortAttribute}&sort_direction=${sortDirection}`
    return `/products/${productId}/reviews?page=${pageIndex}&size=3`
  }

  const { data, error, isLoading, size, setSize } = useSWRInfinite<
    IReviews,
    Error
  >(getKey, apiGetAllReviews, {
    initialSize: 1,
    revalidateAll: false,
    revalidateFirstPage: false
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
