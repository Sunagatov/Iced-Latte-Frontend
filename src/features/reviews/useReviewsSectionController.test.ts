import { renderHook, waitFor } from '@testing-library/react'
import { useReviewsSectionController } from '@/features/reviews/useReviewsSectionController'
import { useAuthStore } from '@/features/auth/public'
import { apiGetProductUserReview } from '@/features/reviews/api'
import { useReviews } from '@/features/reviews/hooks'
import type { Review } from '@/features/reviews/types'

jest.mock('@/features/reviews/api', () => ({
  apiGetProductUserReview: jest.fn(),
}))

jest.mock('@/features/reviews/hooks', () => ({
  useReviews: jest.fn(),
}))

const mockedApiGetProductUserReview = jest.mocked(apiGetProductUserReview)
const mockedUseReviews = jest.mocked(useReviews)

function makeReview(overrides: Partial<Review> = {}): Review {
  return {
    productId: 'product-1',
    productReviewId: 'review-1',
    productRating: 5,
    text: 'Perfect',
    createdAt: '2026-06-19T20:00:00Z',
    userName: 'Smart',
    userLastname: 'Zufar',
    likesCount: 0,
    dislikesCount: 0,
    ...overrides,
  }
}

describe('useReviewsSectionController', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    useAuthStore.setState({
      status: 'authenticated',
      isLoggedIn: true,
      userData: {
        firstName: 'Smart',
        lastName: 'Zufar',
        email: 'smart@example.com',
        address: {},
      },
    })
    mockedUseReviews.mockReturnValue({
      data: [],
      fetchNext: jest.fn().mockResolvedValue(undefined),
      hasNextPage: false,
      isLoading: false,
      isFetchingNextPage: false,
      error: undefined,
      refreshReviews: jest.fn(),
      removeReviewFromCache: jest.fn(),
      updateReviewInCache: jest.fn(),
    })
  })

  it('falls back to the uniquely matching public review when the private user review lookup returns null', async () => {
    const publicUserReview = makeReview()

    mockedApiGetProductUserReview.mockResolvedValue(null)
    mockedUseReviews.mockReturnValue({
      data: [publicUserReview, makeReview({
        productReviewId: 'review-2',
        userName: 'Ada',
        userLastname: 'Lovelace',
      })],
      fetchNext: jest.fn().mockResolvedValue(undefined),
      hasNextPage: false,
      isLoading: false,
      isFetchingNextPage: false,
      error: undefined,
      refreshReviews: jest.fn(),
      removeReviewFromCache: jest.fn(),
      updateReviewInCache: jest.fn(),
    })

    const { result } = renderHook(() =>
      useReviewsSectionController({
        productId: 'product-1',
        reviewsStatistics: { avgRating: 5, reviewsCount: 2, ratingMap: { star5: 2, star4: 0, star3: 0, star2: 0, star1: 0 } },
        refreshStatistics: jest.fn().mockResolvedValue(undefined),
      }),
    )

    await waitFor(() => {
      expect(result.current.isUserReviewLoading).toBe(false)
    })

    expect(result.current.userReview?.productReviewId).toBe('review-1')
    expect(result.current.reviewsState.data).toHaveLength(1)
    expect(result.current.reviewsState.data[0].productReviewId).toBe('review-2')
  })

  it('does not infer ownership when multiple public reviews share the same name', async () => {
    mockedApiGetProductUserReview.mockResolvedValue(null)
    mockedUseReviews.mockReturnValue({
      data: [
        makeReview(),
        makeReview({ productReviewId: 'review-2' }),
      ],
      fetchNext: jest.fn().mockResolvedValue(undefined),
      hasNextPage: false,
      isLoading: false,
      isFetchingNextPage: false,
      error: undefined,
      refreshReviews: jest.fn(),
      removeReviewFromCache: jest.fn(),
      updateReviewInCache: jest.fn(),
    })

    const { result } = renderHook(() =>
      useReviewsSectionController({
        productId: 'product-1',
        reviewsStatistics: { avgRating: 5, reviewsCount: 2, ratingMap: { star5: 2, star4: 0, star3: 0, star2: 0, star1: 0 } },
        refreshStatistics: jest.fn().mockResolvedValue(undefined),
      }),
    )

    await waitFor(() => {
      expect(result.current.isUserReviewLoading).toBe(false)
    })

    expect(result.current.userReview).toBeNull()
    expect(result.current.reviewsState.data).toHaveLength(2)
  })
})
