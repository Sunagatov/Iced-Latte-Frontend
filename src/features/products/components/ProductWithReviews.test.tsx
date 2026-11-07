import { act, render, screen, waitFor } from '@testing-library/react'
import type { IProduct } from '@/features/products/types'
import ProductWithReviews from '@/features/products/components/ProductWithReviews'
import { trackGoogleAnalyticsEvent } from '@/shared/analytics/googleAnalytics'
import * as reviewsApi from '@/features/reviews/public'
import type { IProductReviewsStatistics } from '@/features/reviews/public'

const mockHandleError = jest.fn()

jest.mock('@/features/products/components/ProductOverview', () => ({
  __esModule: true,
  default: ({ reviewsStatistics }: { reviewsStatistics: unknown }) => (
    <div data-testid="product-overview">
      {JSON.stringify(reviewsStatistics)}
    </div>
  ),
}))

jest.mock('next/dynamic', () => ({
  __esModule: true,
  default: () => () => <div data-testid="reviews-section" />,
}))

jest.mock('@/shared/utils/apiError', () => ({
  useToastErrorHandler: () => ({
    handleError: mockHandleError,
  }),
}))

jest.mock('@/shared/analytics/googleAnalytics', () => {
  const actual = jest.requireActual('@/shared/analytics/googleAnalytics')

  return {
    __esModule: true,
    ...actual,
    trackGoogleAnalyticsEvent: jest.fn(),
  }
})

jest.mock('@/features/reviews/public', () => ({
  __esModule: true,
  apiGetProductReviewsStatistics: jest.fn(),
}))

const mockedReviewsApi = jest.mocked(reviewsApi)
const mockedTrackGoogleAnalyticsEvent = jest.mocked(trackGoogleAnalyticsEvent)

describe('ProductWithReviews', () => {
  it('ignores a statistics response from the previously viewed product', async () => {
    let resolveOld!: (value: IProductReviewsStatistics) => void

    mockedReviewsApi.apiGetProductReviewsStatistics
      .mockReturnValueOnce(
        new Promise((resolve) => {
          resolveOld = resolve
        }),
      )
      .mockResolvedValueOnce({
        avgRating: 5,
        reviewsCount: 3,
        ratingMap: { star1: 0, star2: 0, star3: 0, star4: 0, star5: 3 },
      })
    const first = { id: 'first', name: 'First', price: 1 } as IProduct
    const view = render(<ProductWithReviews product={first} />)

    view.rerender(<ProductWithReviews product={{ ...first, id: 'second' }} />)
    await waitFor(() =>
      expect(screen.getByTestId('product-overview')).toHaveTextContent(
        '"reviewsCount":3',
      ),
    )
    await act(async () =>
      resolveOld({
        avgRating: 1,
        reviewsCount: 99,
        ratingMap: { star1: 99, star2: 0, star3: 0, star4: 0, star5: 0 },
      }),
    )
    expect(screen.getByTestId('product-overview')).toHaveTextContent(
      '"reviewsCount":3',
    )
  })
  beforeEach(() => {
    jest.clearAllMocks()
    mockedReviewsApi.apiGetProductReviewsStatistics.mockResolvedValue({
      avgRating: 4.8,
      reviewsCount: 12,
      ratingMap: {} as IProductReviewsStatistics['ratingMap'],
    })
  })

  it('tracks a product view once on mount', async () => {
    const product = {
      id: 'product-1',
      name: 'Iced Latte',
      brandName: 'Iced Latte',
      price: 5.99,
    } as IProduct

    render(<ProductWithReviews product={product} />)

    await waitFor(() => {
      expect(mockedTrackGoogleAnalyticsEvent).toHaveBeenCalledWith(
        'view_item',
        {
          currency: 'USD',
          value: 5.99,
          items: [
            {
              item_brand: 'Iced Latte',
              item_id: 'product-1',
              item_name: 'Iced Latte',
              price: 5.99,
              quantity: 1,
            },
          ],
        },
      )
    })
  })

  it('tracks a new product when the viewed product changes', async () => {
    const firstProduct = {
      id: 'product-1',
      name: 'Iced Latte',
      brandName: 'Iced Latte',
      price: 5.99,
    } as IProduct
    const secondProduct = {
      id: 'product-2',
      name: 'Cold Brew',
      brandName: 'Iced Latte',
      price: 6.49,
    } as IProduct

    const { rerender } = render(<ProductWithReviews product={firstProduct} />)

    rerender(<ProductWithReviews product={secondProduct} />)

    await waitFor(() => {
      expect(mockedTrackGoogleAnalyticsEvent).toHaveBeenCalledWith(
        'view_item',
        expect.objectContaining({
          value: 6.49,
          items: [
            expect.objectContaining({
              item_id: 'product-2',
              item_name: 'Cold Brew',
            }),
          ],
        }),
      )
    })
  })
})
