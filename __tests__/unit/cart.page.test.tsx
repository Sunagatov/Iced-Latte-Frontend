import { render, screen, act } from '@testing-library/react'
import Cart from '@/app/cart/page'
import { useCartStore } from '@/features/cart/store'

jest.mock('@/features/cart/components/CartFull/CartFull', () => ({
  __esModule: true,
  default: () => <div>CartFull</div>,
}))
jest.mock('@/features/cart/components/CartEmpty/CartEmpty', () => ({
  __esModule: true,
  default: () => <div>CartEmpty</div>,
}))
jest.mock('@/shared/components/Loader/Loader', () => ({
  __esModule: true,
  default: () => <div>Loader</div>,
}))

beforeEach(() => {
  useCartStore.setState({
    itemsIds: [],
    tempItems: [],
    count: 0,
    totalPrice: 0,
    isSync: false,
  })
})

describe('Cart page', () => {
  it('shows CartEmpty when no items after hydration', () => {
    render(<Cart />)
    expect(screen.getByText('CartEmpty')).toBeInTheDocument()
  })

  it('shows CartFull when tempItems exist', async () => {
    useCartStore.setState({
      tempItems: [
        {
          id: 'slot-1',
          productInfo: {
            id: 'p1',
            name: 'Coffee',
            price: 10,
            description: '',
            quantity: 1,
            active: true,
            productFileUrl: null,
            averageRating: 0,
            reviewsCount: 0,
            brandName: 'b',
            sellerName: 's',
          },
          productQuantity: 1,
        },
      ],
      itemsIds: [{ productId: 'p1', productQuantity: 1 }],
      count: 1,
      totalPrice: 10,
      isSync: false,
    })
    await act(async () => {
      render(<Cart />)
    })
    expect(screen.getByText('CartFull')).toBeInTheDocument()
  })
})
