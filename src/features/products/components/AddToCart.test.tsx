import { render, screen } from '@testing-library/react'
import AddToCartButton from '@/features/products/components/AddToCart'
import { useCartStore } from '@/features/cart/public'
import type { IProduct } from '@/features/products/types'

const product: IProduct = {
  active: true,
  averageRating: 0,
  brandName: 'Brand',
  description: '',
  id: 'p1',
  name: 'Coffee',
  price: 12,
  productFileUrl: null,
  quantity: 10,
  reviewsCount: 0,
  sellerName: 'Seller',
}

describe('AddToCartButton', () => {
  beforeEach(() => {
    useCartStore.setState({
      count: 0,
      isSync: false,
      itemsIds: [],
      pendingProductIds: new Set(),
      tempItems: [],
      totalPrice: 0,
    })
  })

  it('disables the add button while the product cart mutation is pending', () => {
    useCartStore.setState({ pendingProductIds: new Set(['p1']) })

    render(<AddToCartButton product={product} />)

    expect(screen.getByRole('button', { name: 'Add to cart' })).toBeDisabled()
  })

  it('disables quantity controls while the product cart mutation is pending', () => {
    useCartStore.setState({
      count: 1,
      itemsIds: [{ productId: 'p1', productQuantity: 1 }],
      pendingProductIds: new Set(['p1']),
      totalPrice: 12,
    })

    render(<AddToCartButton product={product} />)

    expect(screen.getByTestId('counter-minus-btn')).toBeDisabled()
    expect(screen.getByTestId('counter-plus-btn')).toBeDisabled()
  })
})
