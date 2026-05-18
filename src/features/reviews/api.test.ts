import * as reviewsApi from '@/features/reviews/api'
import { api } from '@/shared/api/client'

jest.mock('@/shared/api/client', () => ({
  api: jest.fn(),
}))

const mockedApi = jest.mocked(api)

describe('reviews api', () => {
  beforeEach(() => jest.clearAllMocks())

  it('apiGetAllReviews calls url with cache false', async () => {
    mockedApi.mockResolvedValue({
      data: { reviewsWithRatings: [] },
    })
    await reviewsApi.apiGetAllReviews('/products/p1/reviews?page=0')
    expect(mockedApi).toHaveBeenCalledWith(expect.objectContaining({
      cache: false,
      method: 'GET',
      params: expect.objectContaining({ page: 0 }),
      url: '/products/p1/reviews',
    }))
  })

  it('apiAddProductReview posts review', async () => {
    mockedApi.mockResolvedValue({
      data: { productReviewId: 'r1', text: 'nice', createdAt: '' },
    })
    const result = await reviewsApi.apiAddProductReview('p1', 'nice', 5)

    expect(mockedApi).toHaveBeenCalledWith({
      data: { rating: 5, text: 'nice' },
      headers: { 'Content-Type': 'application/json' },
      method: 'POST',
      url: '/products/p1/reviews',
    })
    expect(result.productReviewId).toBe('r1')
  })

  it('apiDeleteProductReview calls delete', async () => {
    mockedApi.mockResolvedValue({ data: undefined })
    await reviewsApi.apiDeleteProductReview('r1', 'p1')
    expect(mockedApi).toHaveBeenCalledWith(expect.objectContaining({
      method: 'DELETE',
      url: '/products/p1/reviews/r1',
    }))
  })

  it('apiGetProductUserReview returns review', async () => {
    mockedApi.mockResolvedValue({
      data: { productReviewId: 'r1' },
    })
    const result = await reviewsApi.apiGetProductUserReview('p1')

    expect(result.productReviewId).toBe('r1')
  })

  it('apiGetUserReviews returns array', async () => {
    mockedApi.mockResolvedValue({
      data: {
        reviewsWithRatings: [{ productReviewId: 'r1' }],
        page: 0,
        totalPages: 1,
        totalElements: 1,
        size: 10,
      },
    })
    const result = await reviewsApi.apiGetUserReviews()

    expect(mockedApi).toHaveBeenCalledWith(expect.objectContaining({
      cache: false,
      method: 'GET',
      params: { page: 0 },
      url: '/users/reviews',
    }))
    expect(result).toHaveLength(1)
  })

  it('apiGetUserReviews loads all pages from the paginated backend response', async () => {
    mockedApi
      .mockResolvedValueOnce({
        data: {
          reviewsWithRatings: [{ productReviewId: 'r1' }],
          page: 0,
          totalPages: 2,
          totalElements: 2,
          size: 10,
        },
      })
      .mockResolvedValueOnce({
        data: {
          reviewsWithRatings: [{ productReviewId: 'r2' }],
          page: 1,
          totalPages: 2,
          totalElements: 2,
          size: 10,
        },
      })

    const result = await reviewsApi.apiGetUserReviews()

    expect(mockedApi).toHaveBeenNthCalledWith(1, expect.objectContaining({
      cache: false,
      method: 'GET',
      params: { page: 0 },
      url: '/users/reviews',
    }))
    expect(mockedApi).toHaveBeenNthCalledWith(2, expect.objectContaining({
      cache: false,
      method: 'GET',
      params: { page: 1, size: 10 },
      url: '/users/reviews',
    }))
    expect(result.map((review) => review.productReviewId)).toEqual(['r1', 'r2'])
  })

  it('apiGetProductReviewsStatistics returns stats with correct shape', async () => {
    const stats = {
      avgRating: 4.5,
      reviewsCount: 10,
      ratingMap: { star5: 5, star4: 3, star3: 1, star2: 1, star1: 0 },
    }

    mockedApi.mockResolvedValue({ data: stats })
    const result = await reviewsApi.apiGetProductReviewsStatistics('p1')

    expect(result.avgRating).toBe(4.5)
    expect(result.reviewsCount).toBe(10)
    expect(result.ratingMap).toBeDefined()
  })

  it('apiRateProductReview posts like', async () => {
    mockedApi.mockResolvedValue({
      data: { productReviewId: 'r1' },
    })
    const result = await reviewsApi.apiRateProductReview('p1', 'r1', true)

    expect(mockedApi).toHaveBeenCalledWith({
      data: { isLike: true },
      headers: { 'Content-Type': 'application/json' },
      method: 'POST',
      url: '/products/p1/reviews/r1/likes',
    })
    expect(result.productReviewId).toBe('r1')
  })
})
