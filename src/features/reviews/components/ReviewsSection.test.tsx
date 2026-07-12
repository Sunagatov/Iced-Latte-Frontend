import { render, screen } from '@testing-library/react'
import ReviewsSection from '@/features/reviews/components/ReviewsSection'
import { useReviewsSectionController } from '@/features/reviews/useReviewsSectionController'
import type { IProduct } from '@/features/products/types'
import type { Review } from '@/features/reviews/types'

jest.mock('@/features/reviews/useReviewsSectionController', () => ({
  useReviewsSectionController: jest.fn(),
}))

jest.mock('@/features/reviews/components/ReviewForm', () => ({
  __esModule: true,
  default: () => <div>ReviewForm</div>,
}))

jest.mock('@/features/reviews/components/ReviewsList/ReviewsList', () => ({
  __esModule: true,
  default: () => <div>ReviewsList</div>,
}))

jest.mock('@/features/reviews/components/ReviewsSorter', () => ({
  __esModule: true,
  default: ({ children }: { children?: React.ReactNode }) => <div>{children}</div>,
}))

jest.mock('@/features/reviews/components/ReviewsFilter', () => ({
  __esModule: true,
  default: () => <div>ReviewsFilter</div>,
}))

jest.mock('@/features/reviews/components/RatingSummary', () => ({
  __esModule: true,
  default: () => <div>RatingSummary</div>,
}))

jest.mock('@/features/reviews/components/AIReviewSummary/AIReviewSummary', () => ({
  __esModule: true,
  default: () => <div>AIReviewSummary</div>,
}))

const mockedUseReviewsSectionController = jest.mocked(useReviewsSectionController)

const product = {
  id: 'product-1',
  reviewsCount: 3,
} as IProduct

function makeReview(): Review {
  return {
    productId: 'product-1',
    productReviewId: 'review-1',
    productRating: 5,
    text: 'Great coffee',
    createdAt: '2026-06-19T20:00:00Z',
    userName: 'Ada',
    userLastname: 'Lovelace',
    likesCount: 0,
    dislikesCount: 0,
  }
}

function mockController(overrides: Partial<ReturnType<typeof useReviewsSectionController>> = {}) {
  mockedUseReviewsSectionController.mockReturnValue({
    clearRatingFilters: jest.fn(),
    errorMessage: null,
    filterRef: { current: null },
    handleReviewDeleted: jest.fn(),
    handleReviewSubmitted: jest.fn(),
    handleShowMoreReviews: jest.fn(),
    reviewsState: {
      data: [],
      error: undefined,
      hasNextPage: false,
      isFetchingNextPage: false,
      isLoading: false,
      refreshReviews: jest.fn(),
      removeReviewFromCache: jest.fn(),
      updateReviewInCache: jest.fn(),
      fetchNext: jest.fn(),
    },
    reviewsSummary: {
      hasAnyReviews: false,
      hasStatistics: false,
      reviewsCount: 0,
    },
    selectedFilterRating: [],
    selectedSortOption: {
      isDefault: true,
      label: 'Newest',
      value: { sortAttribute: 'createdAt', sortDirection: 'desc' },
    },
    isUserReviewLoading: false,
    setSelectedSortOption: jest.fn(),
    setShowFilterDropdown: jest.fn(),
    setShowForm: jest.fn(),
    showFilterDropdown: false,
    showForm: false,
    toggleRatingFilter: jest.fn(),
    userReview: null,
    ...overrides,
  })
}

describe('ReviewsSection', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('hides the review form while the current user review is still loading', () => {
    mockController({ isUserReviewLoading: true })

    render(
      <ReviewsSection
        product={product}
        reviewsStatistics={null}
        refreshStatistics={jest.fn().mockResolvedValue(undefined)}
      />,
    )

    expect(screen.queryByText('ReviewForm')).not.toBeInTheDocument()
  })

  it('hides the review form when the current user already has a review', () => {
    mockController({
      userReview: makeReview(),
      reviewsSummary: {
        hasAnyReviews: true,
        hasStatistics: false,
        reviewsCount: 1,
      },
    })

    render(
      <ReviewsSection
        product={product}
        reviewsStatistics={null}
        refreshStatistics={jest.fn().mockResolvedValue(undefined)}
      />,
    )

    expect(screen.queryByText('ReviewForm')).not.toBeInTheDocument()
    expect(screen.getByText('ReviewsList')).toBeInTheDocument()
  })

  it('shows the review form once no user review exists and loading is complete', () => {
    mockController()

    render(
      <ReviewsSection
        product={product}
        reviewsStatistics={null}
        refreshStatistics={jest.fn().mockResolvedValue(undefined)}
      />,
    )

    expect(screen.getByText('ReviewForm')).toBeInTheDocument()
  })
})
