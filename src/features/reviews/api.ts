import { AxiosResponse } from 'axios'
import { Review, IProductReviewsStatistics } from './types'
import { api } from '@/shared/api/client'

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

export async function apiGetAllReviews(url: string): Promise<IReviews> {
  const response: AxiosResponse<IReviews> = await api.get(url, { cache: false })

  return response.data
}

export async function apiAddProductReview(
  productId: string,
  reviewText: string,
  currentRating: number,
): Promise<SubmittedReviewInfo> {
  const response: AxiosResponse<SubmittedReviewInfo> = await api.post(
    `/products/${productId}/reviews`,
    { text: reviewText, rating: currentRating },
  )

  return response.data
}

export async function apiDeleteProductReview(
  productReviewId: string,
  productId: string,
): Promise<void> {
  await api.delete(`/products/${productId}/reviews/${productReviewId}`)
}

export async function apiGetProductUserReview(
  productId: string,
): Promise<Review> {
  const response: AxiosResponse<Review> = await api.get(
    `/products/${productId}/review`,
    { cache: false },
  )

  return response.data
}

export async function apiGetUserReviews(): Promise<Review[]> {
  const firstPageResponse: AxiosResponse<IReviews> = await api.get(
    '/users/reviews?page=0',
    { cache: false },
  )
  const firstPage = firstPageResponse.data

  if (!firstPage.totalPages || firstPage.totalPages <= 1) {
    return firstPage.reviewsWithRatings
  }

  const remainingPages = await Promise.all(
    Array.from({ length: firstPage.totalPages - 1 }, async (_, index) => {
      const page = index + 1
      const params = new URLSearchParams({ page: String(page) })

      if (firstPage.size) {
        params.set('size', String(firstPage.size))
      }

      const response = await api.get<IReviews>(
        `/users/reviews?${params.toString()}`,
        { cache: false },
      )

      return response.data
    }),
  )

  return [firstPage, ...remainingPages].flatMap((page) => page.reviewsWithRatings)
}

export async function apiGetProductReviewsStatistics(
  productId: string,
): Promise<IProductReviewsStatistics> {
  const response: AxiosResponse<IProductReviewsStatistics> = await api.get(
    `/products/${productId}/reviews/statistics`,
    { cache: false },
  )

  return response.data
}

export async function apiRateProductReview(
  productId: string,
  productReviewId: string,
  isLike: boolean,
): Promise<Review> {
  const response: AxiosResponse<Review> = await api.post(
    `/products/${productId}/reviews/${productReviewId}/likes`,
    { isLike },
  )

  return response.data
}
