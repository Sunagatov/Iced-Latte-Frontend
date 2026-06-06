import { render, screen } from '@testing-library/react'
import CartElement from '@/features/cart/components/CartElement'

jest.mock('@/features/cart/useCartElementState', () => ({
  useCartElementState: () => ({
    isFavourited: false,
    isFavouritePending: false,
    pulse: false,
    toggleFavouriteStatus: jest.fn(),
  }),
}))

jest.mock('@/features/cart/components/CartItemActions', () => ({
  __esModule: true,
  default: () => <div data-testid="cart-item-actions" />,
}))

jest.mock('@/shared/ui/ProductImage', () => ({
  __esModule: true,
  default: ({ alt }: { alt: string }) => <img alt={alt} />,
}))

describe('CartElement', () => {
  it('renders the product description when it is available', () => {
    render(
      <CartElement
        product={{
          id: 'cart-item-1',
          productInfo: {
            id: 'product-1',
            name: 'Pumpkin Spice Latte',
            description: 'Warm pumpkin spice coffee with a smooth latte finish.',
            price: 5.25,
            productFileUrl: null,
            averageRating: 4.5,
            reviewsCount: 12,
            brandName: 'Folgers',
            sellerName: 'Iced Latte Shop',
            weight: 250,
          },
          productQuantity: 1,
        }}
        add={jest.fn()}
        remove={jest.fn()}
        removeAll={jest.fn()}
      />,
    )

    expect(
      screen.getByText('Warm pumpkin spice coffee with a smooth latte finish.'),
    ).toBeInTheDocument()
    expect(screen.getByText('Folgers · Iced Latte Shop')).toBeInTheDocument()
    expect(screen.getByText('4.5')).toBeInTheDocument()
    expect(screen.getByText('(12)')).toBeInTheDocument()
    expect(screen.getByText('250 g.')).toBeInTheDocument()
  })
})
