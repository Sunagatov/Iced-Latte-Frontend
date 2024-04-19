import { Review } from '../ReviewType'

export interface ReviewResponse {
  reviewsWithRatings: Review[]
  page: number
  size: number
  totalElements: number
  totalPages: number
}
