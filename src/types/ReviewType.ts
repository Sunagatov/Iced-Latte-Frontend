export interface Review {
  productReviewId: string | null
  productRating: number | null
  text: string | null
  createdAt: string | null
  userName: string | null
  userLastName: string | null
  // id: string
  isCurrentUserComment?: boolean
  likes?: number
  dislikes?: number
}
