import { api } from './apiConfig/apiConfig'
import { AxiosResponse } from 'axios'

interface ProductReview {
  productReviewId: string
  text: string
  createdAt: string
}

// Вынести в types/ProductReview.ts
export interface Review {
  rating: number
  reviewText: string
  createdAt: string
  userName: string
  userLastName: string
  // id: string
  isCurrentUserComment: boolean;
  likes: number;
  dislikes: number;
}

interface ReviewsResponse {
  reviewsWithRatings: Review[]
}

export async function apiAddProductReview(
  productId: string,
  reviewText: string,
): Promise<ProductReview> {
  const response: AxiosResponse<ProductReview> = await api.post(
    `/products/${productId}/reviews`,
    {
      text: reviewText,
    },
  )

  return response.data
}

export async function apiDeleteProductReview(
  productId: string,
  reviewId: string,
): Promise<void> {
  await api.delete(`/products/${productId}/reviews/${reviewId}`)
}

export async function apiGetProductReviews(
  productId: string,
  page: number = 0,
): Promise<ReviewsResponse> {
  const response: AxiosResponse<ReviewsResponse> = await api.get(
    `/products/${productId}/reviews?page=${page}`,
  )

  return response.data
}
