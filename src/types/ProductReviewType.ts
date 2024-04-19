export interface Review {
  productReviewId: string | null
  rating: number | null
  text: string | null
  createdAt: string | null
  userName: string | null
  userLastName: string | null
  // id: string
  isCurrentUserComment?: boolean
  likes?: number
  dislikes?: number
}

export interface ReviewsResponse {
  reviewsWithRatings: Review[]
  page: number
  size: number
  totalElements: number
  totalPages: number
}
