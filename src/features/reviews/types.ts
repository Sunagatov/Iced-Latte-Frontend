export interface Review {
  productId: string
  productReviewId: string | null
  productRating: number | null
  text: string | null
  createdAt: string | null
  userName: string | null
  userLastname: string | null
  isCurrentUserComment?: boolean
  likesCount: number
  dislikesCount: number
  aiSummary?: string | null
}

export interface IProductReviewsStatistics {
  avgRating: number
  reviewsCount: number
  ratingMap: Record<string, number>
}
