export interface Review {
  productReviewId: string
  rating: number
  text: string
  createdAt: string
  userName: string
  userLastName: string
  // id: string
  // isCurrentUserComment: boolean
  likes: number
  dislikes: number
}

export interface ReviewsResponse {
  reviewsWithRatings: Review[]
  page: number
  size: number
  totalElements: number
  totalPages: number
}
