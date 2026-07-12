import { fireEvent, render, screen } from '@testing-library/react'
import StarRating from '@/features/reviews/components/StarRating'
import { useAuthStore } from '@/features/auth/public'
import { useProductRatingStore } from '@/features/reviews/store'

const push = jest.fn()

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push }),
}))

describe('StarRating', () => {
  beforeEach(() => {
    push.mockClear()
    useAuthStore.setState({ status: 'anonymous', isLoggedIn: false })
    useProductRatingStore.setState({ ratings: {} })
  })

  it('preserves product context when redirecting anonymous users to signin', () => {
    render(<StarRating productId="product-1" count={5} />)

    fireEvent.click(screen.getByRole('button', { name: 'Rate 4 stars' }))

    expect(push).toHaveBeenCalledWith('/signin?next=%2Fproduct%2Fproduct-1')
  })
})
