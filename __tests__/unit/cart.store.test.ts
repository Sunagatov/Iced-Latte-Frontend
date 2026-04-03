import { useCartStore } from '@/features/cart/store'
import { useAuthStore } from '@/features/auth/store'
import * as cartApi from '@/features/cart/api'
import * as productsApi from '@/features/products/api'
import { ICartItem } from '@/features/cart/types'

jest.mock('@/features/cart/api', () => ({
  mergeCarts: jest.fn(),
  removeCartItem: jest.fn(),
  changeCartItemQuantity: jest.fn(),
}))
jest.mock('@/features/products/api', () => ({
  getProductByIds: jest.fn(),
}))
jest.mock('@/features/auth/store', () => ({
  useAuthStore: { getState: jest.fn(() => ({ token: null })) },
}))

const mockedCartApi = jest.mocked(cartApi)
const mockedProductsApi = jest.mocked(productsApi)
const mockedAuthStore = jest.mocked(useAuthStore) as { getState: jest.Mock }

function makeProduct(id: string, price = 10) {
  return { id, name: 'p', description: '', price, quantity: 10, active: true, productFileUrl: null, averageRating: 0, reviewsCount: 0, brandName: 'b', sellerName: 's' }
}

function makeCartItem(id: string, qty = 1): ICartItem {
  return { id: `slot-${id}`, productInfo: makeProduct(id), productQuantity: qty }
}

beforeEach(() => {
  useCartStore.setState({ itemsIds: [], tempItems: [], count: 0, totalPrice: 0, isSync: false })
  jest.clearAllMocks()
  mockedAuthStore.getState.mockReturnValue({ token: null })
})

describe('cart store — guest add/remove', () => {
  it('add increases count for new item', async () => {
    mockedProductsApi.getProductByIds.mockResolvedValue([makeProduct('p1')])
    useCartStore.getState().add('p1')
    await Promise.resolve()
    expect(useCartStore.getState().count).toBe(1)
  })

  it('add increments quantity for existing item', () => {
    useCartStore.setState({
      itemsIds: [{ productId: 'p1', productQuantity: 1 }],
      tempItems: [makeCartItem('p1', 1)],
      count: 1,
      totalPrice: 10,
      isSync: false,
    })
    useCartStore.getState().add('p1')
    expect(useCartStore.getState().count).toBe(2)
  })

  it('remove decrements quantity', () => {
    useCartStore.setState({
      itemsIds: [{ productId: 'p1', productQuantity: 2 }],
      tempItems: [makeCartItem('p1', 2)],
      count: 2,
      totalPrice: 20,
      isSync: false,
    })
    useCartStore.getState().remove('p1')
    expect(useCartStore.getState().count).toBe(1)
  })

  it('remove eliminates item when quantity reaches 0', () => {
    useCartStore.setState({
      itemsIds: [{ productId: 'p1', productQuantity: 1 }],
      tempItems: [makeCartItem('p1', 1)],
      count: 1,
      totalPrice: 10,
      isSync: false,
    })
    useCartStore.getState().remove('p1')
    expect(useCartStore.getState().count).toBe(0)
    expect(useCartStore.getState().itemsIds).toHaveLength(0)
  })
})

describe('cart store — resetCart / setTempItems', () => {
  it('resetCart clears all state', () => {
    useCartStore.setState({ itemsIds: [{ productId: 'p1', productQuantity: 1 }], count: 1, totalPrice: 10, isSync: true, tempItems: [] })
    useCartStore.getState().resetCart()
    const s = useCartStore.getState()
    expect(s.count).toBe(0)
    expect(s.isSync).toBe(false)
  })

  it('setTempItems syncs state from items array', () => {
    const items = [makeCartItem('p1', 3)]
    useCartStore.getState().setTempItems(items)
    const s = useCartStore.getState()
    expect(s.count).toBe(3)
    expect(s.totalPrice).toBe(30)
    expect(s.isSync).toBe(true)
  })
})

describe('cart store — createCart', () => {
  it('updates state from merged cart response', async () => {
    mockedCartApi.mergeCarts.mockResolvedValue({
      id: 'c1', userId: 'u1', createdAt: '', closedAt: null,
      itemsQuantity: 2, itemsTotalPrice: 20, productsQuantity: 2,
      items: [makeCartItem('p1', 2)],
    })
    await useCartStore.getState().createCart({ items: [{ productId: 'p1', productQuantity: 2 }] })
    expect(useCartStore.getState().totalPrice).toBe(20)
    expect(useCartStore.getState().isSync).toBe(true)
  })
})

describe('cart store — updateCartItem', () => {
  it('updates state from response', async () => {
    mockedCartApi.changeCartItemQuantity.mockResolvedValue({
      id: 'c1', userId: 'u1', createdAt: '', closedAt: null,
      itemsQuantity: 1, itemsTotalPrice: 10, productsQuantity: 1,
      items: [makeCartItem('p1', 1)],
    })
    await useCartStore.getState().updateCartItem({ shoppingCartItemId: 'slot-p1', productQuantityChange: 1 })
    expect(useCartStore.getState().totalPrice).toBe(10)
  })
})

describe('cart store — clearCart (guest)', () => {
  it('clears state without calling removeCartItem', async () => {
    useCartStore.setState({ itemsIds: [{ productId: 'p1', productQuantity: 1 }], tempItems: [makeCartItem('p1')], count: 1, totalPrice: 10, isSync: false })
    await useCartStore.getState().clearCart()
    expect(mockedCartApi.removeCartItem).not.toHaveBeenCalled()
    expect(useCartStore.getState().count).toBe(0)
  })
})

describe('cart store — removeFullProduct (guest)', () => {
  it('removes item from guest cart', () => {
    useCartStore.setState({
      itemsIds: [{ productId: 'p1', productQuantity: 1 }],
      tempItems: [makeCartItem('p1', 1)],
      count: 1,
      totalPrice: 10,
      isSync: false,
    })
    useCartStore.getState().removeFullProduct('p1')
    expect(useCartStore.getState().itemsIds).toHaveLength(0)
  })
})

describe('cart store — getCartItems', () => {
  it('hydrates tempItems from product API', async () => {
    useCartStore.setState({ itemsIds: [{ productId: 'p1', productQuantity: 2 }], tempItems: [], count: 2, totalPrice: 0, isSync: false })
    mockedProductsApi.getProductByIds.mockResolvedValue([makeProduct('p1', 15)])
    await useCartStore.getState().getCartItems()
    expect(useCartStore.getState().totalPrice).toBe(30)
  })
})
