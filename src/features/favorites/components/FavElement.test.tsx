import { render, screen } from '@testing-library/react'
import FavElement from '@/features/favorites/components/FavElement'

jest.mock('@/features/favorites/useFavoriteProductActions', () => ({
  useFavoriteProductActions: () => ({
    addToCart: jest.fn(),
    decreaseCartQuantity: jest.fn(),
    handleToggleFavourite: jest.fn(),
    isCartPending: false,
    isFavourited: true,
    isPending: false,
    quantity: 0,
    removeFromCart: jest.fn(),
  }),
}))

jest.mock('@/features/favorites/components/FavoriteCartStepper', () => ({
  __esModule: true,
  default: () => <div data-testid="favorite-cart-stepper" />,
}))

jest.mock('@/features/favorites/components/FavoriteToggleButton', () => ({
  __esModule: true,
  default: () => <button type="button">Toggle favourite</button>,
}))

jest.mock('@/shared/ui/ProductImage', () => ({
  __esModule: true,
  default: ({ alt }: { alt: string }) => <img alt={alt} />,
}))

describe('FavElement', () => {
  it('renders enriched favorite product details', () => {
    render(
      <FavElement
        product={{
          id: 'product-1',
          name: 'Cortado',
          description: 'Balanced espresso with steamed milk.',
          price: 3.99,
          productFileUrl: null,
          averageRating: 4.3,
          reviewsCount: 9,
          brandName: 'Nescafe',
          sellerName: 'Iced Latte Shop',
          weight: 200,
        }}
      />,
    )

    expect(screen.getByText('Nescafe')).toBeInTheDocument()
    expect(screen.getByText('4.3')).toBeInTheDocument()
    expect(screen.getByText('(9)')).toBeInTheDocument()
    expect(screen.getByText('· 200 g.')).toBeInTheDocument()
    expect(
      screen.getByText('Balanced espresso with steamed milk.'),
    ).toBeInTheDocument()
  })
})
