import * as reviewsApi from '@/features/reviews/api'
import { api } from '@/shared/api/client'

jest.mock('@/shared/api/client', () => ({ api: { get: jest.fn(), post: jest.fn(), delete: jest.fn() } }))

const mockedApi = jest.mocked(api)

describe('reviews api', () => {
  beforeEach(() => jest.clearAllMocks())

  it('apiGetProductReviews calls correct url', async () => {
    ;(mockedApi.get as jest.Mock).mockResolvedValue({ data: { reviewsWithRatings: [], page: 0, totalPages: 1, totalElements: 0, size: 3 } })
    await reviewsApi.apiGetProductReviews('p1')
    expect(mockedApi.get).toHaveBeenCalledWith(expect.stringContaining('/products/p1/reviews'))
  })

  it('apiGetAllReviews calls url with cache false', async () => {
    ;(mockedApi.get as jest.Mock).mockResolvedValue({ data: { reviewsWithRatings: [] } })
    await reviewsApi.apiGetAllReviews('/products/p1/reviews?page=0')
    expect(mockedApi.get).toHaveBeenCalledWith('/products/p1/reviews?page=0', { cache: false })
  })

  it('apiAddProductReview posts review', async () => {
    ;(mockedApi.post as jest.Mock).mockResolvedValue({ data: { productReviewId: 'r1', text: 'nice', createdAt: '' } })
    const result = await reviewsApi.apiAddProductReview('p1', 'nice', 5)
    expect(mockedApi.post).toHaveBeenCalledWith('/products/p1/reviews', { text: 'nice', rating: 5 })
    expect(result.productReviewId).toBe('r1')
  })

  it('apiDeleteProductReview calls delete', async () => {
    ;(mockedApi.delete as jest.Mock).mockResolvedValue({ data: undefined })
    await reviewsApi.apiDeleteProductReview('r1', 'p1')
    expect(mockedApi.delete).toHaveBeenCalledWith('/products/p1/reviews/r1')
  })

  it('apiGetProductUserReview returns review', async () => {
    ;(mockedApi.get as jest.Mock).mockResolvedValue({ data: { productReviewId: 'r1' } })
    const result = await reviewsApi.apiGetProductUserReview('p1')
    expect(result.productReviewId).toBe('r1')
  })

  it('apiGetUserReviews returns array', async () => {
    ;(mockedApi.get as jest.Mock).mockResolvedValue({ data: { reviewsWithRatings: [{ productReviewId: 'r1' }] } })
    const result = await reviewsApi.apiGetUserReviews()
    expect(result).toHaveLength(1)
  })

  it('apiGetProductReviewsStatistics returns stats', async () => {
    ;(mockedApi.get as jest.Mock).mockResolvedValue({ data: { averageRating: 4.5 } })
    const result = await reviewsApi.apiGetProductReviewsStatistics('p1')
    expect(result).toEqual({ averageRating: 4.5 })
  })

  it('apiRateProductReview posts like', async () => {
    ;(mockedApi.post as jest.Mock).mockResolvedValue({ data: { productReviewId: 'r1' } })
    const result = await reviewsApi.apiRateProductReview('p1', 'r1', true)
    expect(mockedApi.post).toHaveBeenCalledWith('/products/p1/reviews/r1/likes', { isLike: true })
    expect(result.productReviewId).toBe('r1')
  })
})
