export interface IProductReviewsStatistics {
  productId: string
  avgRating: string
  reviewsCount: number
  ratingMap: {
    star5: number
    star4: number
    star3: number
    star2: number
    star1: number
  }
}