import * as reviewsApi from '@/features/reviews/api'
import { api } from '@/shared/api/client'

jest.mock('@/shared/api/client', () => ({
  api: { get: jest.fn(), post: jest.fn(), delete: jest.fn() },
}))

const mockedApi = jest.mocked(api) as jest.Mocked<typeof api>

describe('reviews api', () => {
  beforeEach(() => jest.clearAllMocks())

  it('apiGetAllReviews calls url with cache false', async () => {
    ;(mockedApi.get as jest.Mock).mockResolvedValue({
      data: { reviewsWithRatings: [] },
    })
    await reviewsApi.apiGetAllReviews('/products/p1/reviews?page=0')
    expect(mockedApi.get).toHaveBeenCalledWith('/products/p1/reviews?page=0', {
      cache: false,
    })
  })

  it('apiAddProductReview posts review', async () => {
    ;(mockedApi.post as jest.Mock).mockResolvedValue({
      data: { productReviewId: 'r1', text: 'nice', createdAt: '' },
    })
    const result = await reviewsApi.apiAddProductReview('p1', 'nice', 5)

    expect(mockedApi.post).toHaveBeenCalledWith('/products/p1/reviews', {
      text: 'nice',
      rating: 5,
    })
    expect(result.productReviewId).toBe('r1')
  })

  it('apiDeleteProductReview calls delete', async () => {
    ;(mockedApi.delete as jest.Mock).mockResolvedValue({ data: undefined })
    await reviewsApi.apiDeleteProductReview('r1', 'p1')
    expect(mockedApi.delete).toHaveBeenCalledWith('/products/p1/reviews/r1')
  })

  it('apiGetProductUserReview returns review', async () => {
    ;(mockedApi.get as jest.Mock).mockResolvedValue({
      data: { productReviewId: 'r1' },
    })
    const result = await reviewsApi.apiGetProductUserReview('p1')

    expect(result.productReviewId).toBe('r1')
  })

  it('apiGetUserReviews returns array', async () => {
    ;(mockedApi.get as jest.Mock).mockResolvedValue({
      data: { reviewsWithRatings: [{ productReviewId: 'r1' }] },
    })
    const result = await reviewsApi.apiGetUserReviews()

    expect(result).toHaveLength(1)
  })

  it('apiGetProductReviewsStatistics returns stats with correct shape', async () => {
    const stats = {
      avgRating: 4.5,
      reviewsCount: 10,
      ratingMap: { star5: 5, star4: 3, star3: 1, star2: 1, star1: 0 },
    }

    ;(mockedApi.get as jest.Mock).mockResolvedValue({ data: stats })
    const result = await reviewsApi.apiGetProductReviewsStatistics('p1')

    expect(result.avgRating).toBe(4.5)
    expect(result.reviewsCount).toBe(10)
    expect(result.ratingMap).toBeDefined()
  })

  it('apiRateProductReview posts like', async () => {
    ;(mockedApi.post as jest.Mock).mockResolvedValue({
      data: { productReviewId: 'r1' },
    })
    const result = await reviewsApi.apiRateProductReview('p1', 'r1', true)

    expect(mockedApi.post).toHaveBeenCalledWith(
      '/products/p1/reviews/r1/likes',
      { isLike: true },
    )
    expect(result.productReviewId).toBe('r1')
  })
})
