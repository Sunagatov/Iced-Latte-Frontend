import { Review, IProductReviewsStatistics } from './types'
import {
  addNewProductReview,
  addProductReviewLike,
  deleteProductReview,
  getProductReview,
  getProductReviewsAndRatings,
  getRatingAndReviewStat,
  getUserReviews,
  type GetProductReviewsAndRatingsParams,
  type ProductReviewRatingStats,
} from '@/shared/api/generated/productReview'

export interface IReviews {
  reviewsWithRatings: Review[]
  page: number
  totalPages: number
  totalElements: number
  size: number
}

export interface SubmittedReviewInfo {
  productReviewId: string
  text: string
  createdAt: string
}

function getReviewParamsFromPath(url: string): {
  params: GetProductReviewsAndRatingsParams
  productId: string
} {
  const [path, queryString = ''] = url.split('?')
  const productId = path.match(/\/products\/([^/]+)\/reviews/)?.[1]
  const searchParams = new URLSearchParams(queryString)
  const getNumber = (name: string) => {
    const value = searchParams.get(name)

    return value ? Number(value) : undefined
  }
  const productRatings = searchParams.get('productRatings')

  if (!productId) {
    throw new Error(`Unsupported product reviews URL: ${url}`)
  }

  return {
    productId,
    params: {
      page: getNumber('page'),
      size: getNumber('size'),
      sort_attribute: searchParams.get('sort_attribute') as GetProductReviewsAndRatingsParams['sort_attribute'],
      sort_direction: searchParams.get('sort_direction') as GetProductReviewsAndRatingsParams['sort_direction'],
      productRatings: productRatings
        ? productRatings.split(',').filter(Boolean).map(Number)
        : undefined,
    },
  }
}

export async function apiGetAllReviews(url: string): Promise<IReviews> {
  const { params, productId } = getReviewParamsFromPath(url)
  const options = { cache: false } as object

  return (await getProductReviewsAndRatings(productId, params, options)) as IReviews
}

export async function apiAddProductReview(
  productId: string,
  reviewText: string,
  currentRating: number,
  turnstileToken?: string,
): Promise<SubmittedReviewInfo> {
  return (await addNewProductReview(productId, {
    text: reviewText,
    rating: currentRating,
    ...(turnstileToken ? { turnstileToken } : {}),
  })) as SubmittedReviewInfo
}

export async function apiDeleteProductReview(
  productReviewId: string,
  productId: string,
): Promise<void> {
  await deleteProductReview(productId, productReviewId)
}

export async function apiGetProductUserReview(
  productId: string,
): Promise<Review> {
  const options = { cache: false } as object

  return (await getProductReview(productId, options)) as Review
}

export async function apiGetUserReviews(): Promise<Review[]> {
  const options = { cache: false } as object
  const firstPage = await getUserReviews({ page: 0 }, options) as IReviews

  if (!firstPage.totalPages || firstPage.totalPages <= 1) {
    return firstPage.reviewsWithRatings
  }

  const remainingPages = await Promise.all(
    Array.from({ length: firstPage.totalPages - 1 }, async (_, index) => {
      const page = index + 1

      return getUserReviews({
        page,
        size: firstPage.size || undefined,
      }, options) as Promise<IReviews>
    }),
  )

  return [firstPage, ...remainingPages].flatMap((page) => page.reviewsWithRatings)
}

export async function apiGetProductReviewsStatistics(
  productId: string,
): Promise<IProductReviewsStatistics> {
  const options = { cache: false } as object

  return (await getRatingAndReviewStat(
    productId,
    options,
  )) as ProductReviewRatingStats
}

export async function apiRateProductReview(
  productId: string,
  productReviewId: string,
  isLike: boolean,
): Promise<Review> {
  return (await addProductReviewLike(productId, productReviewId, {
    isLike,
  })) as Review
}
