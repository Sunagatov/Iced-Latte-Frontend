import { getProductReviewSignInUrl } from '@/features/reviews/navigation'

describe('review navigation', () => {
  it('builds a signin URL that returns to the product page', () => {
    expect(getProductReviewSignInUrl('product-1')).toBe(
      '/signin?next=%2Fproduct%2Fproduct-1',
    )
  })
})
