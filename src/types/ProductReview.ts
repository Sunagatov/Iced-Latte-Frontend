export interface ProductReview {
  productReviewId: string
  text: string
  createdAt: string
}

export interface Review {
  rating: number
  reviewText: string
  createdAt: string
  userName: string
  userLastName: string
  // id: string
  isCurrentUserComment: boolean
  likes: number
  dislikes: number
}

export interface ReviewsResponse {
  reviewText: string
  reviewsWithRatings: Review[]
}
