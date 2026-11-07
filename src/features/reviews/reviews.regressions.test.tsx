import { act, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { SWRConfig } from 'swr'
import ReviewsSection from './components/ReviewsSection'
import UserReviews from './components/UserReviews'
import { useAuthStore } from '@/features/auth/public'
import { useProductRatingStore } from './store'
import {
  apiGetAllReviews,
  apiGetProductUserReview,
  apiAddProductReview,
  apiGetUserReviews,
} from './api'
import type { Review } from './types'
import type { IProduct } from '@/features/products/types'

jest.mock('./api', () => ({
  apiGetAllReviews: jest.fn(),
  apiGetProductUserReview: jest.fn(),
  apiAddProductReview: jest.fn(),
  apiGetUserReviews: jest.fn(),
}))
jest.mock('next/navigation', () => ({ useRouter: () => ({ push: jest.fn() }) }))
jest.mock('./config', () => ({ reviewsTurnstileEnabled: false }))
jest.mock('@/shared/ui/TurnstileWidget', () => ({
  __esModule: true,
  default: () => null,
}))
const getReviews = jest.mocked(apiGetAllReviews)
const getOwn = jest.mocked(apiGetProductUserReview)
const add = jest.mocked(apiAddProductReview)
const makeReview = (n: number): Review => ({
  productId: 'p',
  productReviewId: `r${n}`,
  productRating: 5,
  text: `Review ${n}`,
  createdAt: '2026-11-07T10:00:00Z',
  userName: 'Fixture',
  userLastname: 'User',
  likesCount: 0,
  dislikesCount: 0,
})
const statistics = {
  avgRating: 5,
  reviewsCount: 4,
  ratingMap: { star5: 4, star4: 0, star3: 0, star2: 0, star1: 0 },
}
let rows: Review[]

function section(stats: typeof statistics | null = statistics) {
  return render(
    <SWRConfig
      value={{
        provider: () => new Map(),
        revalidateOnFocus: false,
        shouldRetryOnError: false,
      }}
    >
      <ReviewsSection
        product={{ id: 'p', reviewsCount: 4 } as IProduct}
        reviewsStatistics={stats}
        refreshStatistics={async () => {}}
      />
    </SWRConfig>,
  )
}
async function draft() {
  fireEvent.click(await screen.findByRole('button', { name: 'Write a review' }))
  fireEvent.click(screen.getByRole('button', { name: 'Rate 5 stars' }))
  fireEvent.change(screen.getByPlaceholderText(/what did you like/i), {
    target: { value: 'My unsaved review' },
  })
}
beforeEach(() => {
  jest.resetAllMocks()
  useAuthStore.setState({
    status: 'authenticated',
    isLoggedIn: true,
    userData: {
      firstName: 'A',
      lastName: 'User',
      email: 'a@example.test',
      address: {},
    },
  })
  useProductRatingStore.setState({ ratings: {} })
  rows = [1, 2, 3, 4].map(makeReview)
  getOwn.mockResolvedValue(null)
  getReviews.mockImplementation(async (url) => {
    const page = Number(
      new URL(url, 'https://example.test').searchParams.get('page') || 0,
    )

    return {
      reviewsWithRatings: rows.slice(page * 3, page * 3 + 3),
      page,
      size: 3,
      totalPages: Math.ceil(rows.length / 3),
      totalElements: rows.length,
    }
  })
})

it('preserves a draft when sorting or filtering reloads the list', async () => {
  section()
  await draft()
  fireEvent.click(screen.getByRole('button', { name: 'Most recent' }))
  fireEvent.click(screen.getByRole('button', { name: 'Oldest first' }))
  await waitFor(() =>
    expect(getReviews).toHaveBeenCalledWith(
      expect.stringContaining('sort_direction=asc'),
    ),
  )
  expect(screen.getByPlaceholderText(/what did you like/i)).toHaveValue(
    'My unsaved review',
  )
  fireEvent.click(screen.getByRole('button', { name: 'Filter' }))
  fireEvent.click(screen.getByRole('button', { name: /^5\s+4$/ }))
  await waitFor(() =>
    expect(getReviews).toHaveBeenCalledWith(
      expect.stringContaining('productRatings=5'),
    ),
  )
  expect(screen.getByPlaceholderText(/what did you like/i)).toHaveValue(
    'My unsaved review',
  )
})

it('uses fresh page totals when more reviews arrive', async () => {
  section()
  await screen.findByText('Review 1')
  rows = [1, 2, 3, 4, 5, 6, 7].map(makeReview)
  fireEvent.click(screen.getByRole('button', { name: 'Show more reviews' }))
  await screen.findByText('Review 6')
  fireEvent.click(screen.getByRole('button', { name: 'Show more reviews' }))
  await screen.findByText('Review 7')
})

it('keeps loaded reviews and offers retry after a next-page failure', async () => {
  section()
  await screen.findByText('Review 1')
  getReviews.mockRejectedValueOnce(new Error('Next page unavailable'))
  fireEvent.click(screen.getByRole('button', { name: 'Show more reviews' }))
  await screen.findByRole('button', { name: 'Retry loading reviews' })
  expect(screen.getByText('Review 1')).toBeVisible()
})

it('does not offer creation when checking ownership failed', async () => {
  getOwn.mockRejectedValueOnce(new Error('Unavailable'))
  section()
  await screen.findByRole('button', { name: 'Retry checking your review' })
  expect(
    screen.queryByRole('button', { name: 'Write a review' }),
  ).not.toBeInTheDocument()
  fireEvent.click(
    screen.getByRole('button', { name: 'Retry checking your review' }),
  )
  await screen.findByRole('button', { name: 'Write a review' })
})

it('keeps sorting and filtering when statistics are unavailable', async () => {
  section(null)
  await screen.findByText('Review 1')
  expect(screen.getByRole('button', { name: 'Most recent' })).toBeVisible()
  expect(screen.getByRole('button', { name: 'Filter' })).toBeVisible()
})

it('does not claim no matches when the matching own review is displayed', async () => {
  getOwn.mockResolvedValue(makeReview(1))
  rows = [makeReview(1)]
  section()
  await screen.findByText('Your review')
  fireEvent.click(screen.getByRole('button', { name: 'Filter' }))
  fireEvent.click(screen.getByRole('button', { name: /^5\s+4$/ }))
  await waitFor(() =>
    expect(getReviews).toHaveBeenCalledWith(
      expect.stringContaining('productRatings=5'),
    ),
  )
  expect(
    screen.queryByText('No reviews match this filter.'),
  ).not.toBeInTheDocument()
})

it('disables cancellation while publishing', async () => {
  let resolve!: (value: never) => void

  add.mockReturnValueOnce(
    new Promise((done) => {
      resolve = done
    }),
  )
  section()
  await draft()
  fireEvent.click(screen.getByRole('button', { name: 'Submit review' }))
  expect(screen.getByRole('button', { name: 'Cancel' })).toBeDisabled()
  await act(async () => resolve({} as never))
})

it('clears a submission error when cancelling and opening a fresh form', async () => {
  add.mockRejectedValueOnce({
    isAxiosError: true,
    response: { status: 400, data: { type: 'validation-failed' } },
  })
  section()
  await draft()
  fireEvent.click(screen.getByRole('button', { name: 'Submit review' }))
  await screen.findByText('Please check the form for errors.')
  fireEvent.click(screen.getByRole('button', { name: 'Cancel' }))
  fireEvent.click(screen.getByRole('button', { name: 'Write a review' }))
  expect(
    screen.queryByText('Please check the form for errors.'),
  ).not.toBeInTheDocument()
  expect(screen.getByPlaceholderText(/what did you like/i)).toHaveValue('')
})

it('recovers a saved review after its submission response is lost', async () => {
  add.mockRejectedValueOnce(new Error('Response lost'))
  section()
  await draft()
  rows = [makeReview(9)]
  getOwn.mockResolvedValue(makeReview(9))
  fireEvent.click(screen.getByRole('button', { name: 'Submit review' }))
  await screen.findByText('Your review')
  expect(screen.getByText('Review 9')).toBeVisible()
  expect(add).toHaveBeenCalledTimes(1)
})

it('does not reuse another account\'s My Reviews cache', async () => {
  const get = jest.mocked(apiGetUserReviews)

  get
    .mockResolvedValueOnce([makeReview(1)])
    .mockResolvedValueOnce([makeReview(2)])
  render(
    <SWRConfig value={{ provider: () => new Map() }}>
      <UserReviews />
    </SWRConfig>,
  )
  await screen.findByText('Review 1')
  act(() =>
    useAuthStore.setState({
      userData: {
        firstName: 'B',
        lastName: 'User',
        email: 'b@example.test',
        address: {},
      },
    }),
  )
  await screen.findByText('Review 2')
  expect(screen.queryByText('Review 1')).not.toBeInTheDocument()
})
