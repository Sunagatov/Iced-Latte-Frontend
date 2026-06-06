import { fireEvent, render, screen } from '@testing-library/react'
import ReviewsList from '@/features/reviews/components/ReviewsList/ReviewsList'
import { useAuthStore } from '@/features/auth/public'
import type { Review } from '@/features/reviews/types'

const push = jest.fn()

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push }),
}))

jest.mock('@/features/reviews/api', () => ({
  apiDeleteProductReview: jest.fn(),
  apiRateProductReview: jest.fn(),
}))

const review: Review = {
  productId: 'product-1',
  productReviewId: 'review-1',
  productRating: 5,
  text: 'Excellent coffee.',
  createdAt: '2026-06-01T12:00:00Z',
  userName: 'Ada',
  userLastname: 'Lovelace',
  likesCount: 2,
  dislikesCount: 0,
}

describe('ReviewsList', () => {
  beforeEach(() => {
    push.mockClear()
    useAuthStore.setState({ status: 'anonymous', isLoggedIn: false })
  })

  it('preserves product context when anonymous users vote on a review', () => {
    render(
      <ReviewsList
        productId="product-1"
        reviews={[review]}
        hasNextPage={false}
        showMoreReviews={jest.fn()}
        isFetchingNextPage={false}
        userReview={null}
      />,
    )

    fireEvent.click(screen.getByRole('button', { name: /mark review as helpful/i }))

    expect(push).toHaveBeenCalledWith('/signin?next=%2Fproduct%2Fproduct-1')
  })
})
