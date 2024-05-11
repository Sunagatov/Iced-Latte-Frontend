export interface Review {
  productId: string
  productReviewId: string | null
  productRating: number | null
  text: string | null
  createdAt: string | null
  userName: string | null
  userLastName: string | null
  isCurrentUserComment?: boolean
  likesCount: number
  dislikesCount: number
}
