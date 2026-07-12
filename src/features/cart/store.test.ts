import {
  MAX_CART_ITEM_QUANTITY,
  useCartStore,
} from '@/features/cart/public'
import * as cartApi from '@/features/cart/cartApi'
import * as productsApi from '@/features/products/api'
import type { ICartItem } from '@/features/cart/cartTypes'
import { setClientAuthStatus } from '@/shared/auth/sessionStatus'

jest.mock('@/features/cart/cartApi', () => ({
  fetchCart: jest.fn(),
  mergeCarts: jest.fn(),
  removeCartItem: jest.fn(),
  changeCartItemQuantity: jest.fn(),
}))
jest.mock('@/features/products/api', () => ({
  getProductByIds: jest.fn(),
}))
const mockedCartApi = jest.mocked(cartApi)
const mockedProductsApi = jest.mocked(productsApi)

function makeProduct(id: string, price = 10) {
  return {
    id,
    name: 'p',
    description: '',
    price,
    quantity: 10,
    active: true,
    productFileUrl: null,
    averageRating: 0,
    reviewsCount: 0,
    brandName: 'b',
    sellerName: 's',
  }
}

function makeCartItem(id: string, qty = 1): ICartItem {
  return {
    id: `slot-${id}`,
    productInfo: makeProduct(id),
    productQuantity: qty,
  }
}

beforeEach(() => {
  useCartStore.setState({
    itemsIds: [],
    tempItems: [],
    count: 0,
    totalPrice: 0,
    isSync: false,
  })
  jest.clearAllMocks()
  setClientAuthStatus('anonymous')
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

  it('add does not increase quantity above the cart item limit', () => {
    useCartStore.setState({
      itemsIds: [{ productId: 'p1', productQuantity: MAX_CART_ITEM_QUANTITY }],
      tempItems: [makeCartItem('p1', MAX_CART_ITEM_QUANTITY)],
      count: MAX_CART_ITEM_QUANTITY,
      totalPrice: 990,
      isSync: false,
    })
    useCartStore.getState().add('p1')
    expect(useCartStore.getState().count).toBe(MAX_CART_ITEM_QUANTITY)
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

  it('remove drops stale negative quantities from guest cart ids', () => {
    useCartStore.setState({
      itemsIds: [{ productId: 'p1', productQuantity: -2 }],
      tempItems: [],
      count: -2,
      totalPrice: 0,
      isSync: false,
    })

    useCartStore.getState().remove('p1')

    expect(useCartStore.getState().itemsIds).toHaveLength(0)
    expect(useCartStore.getState().count).toBe(0)
  })
})

describe('cart store — resetCart / setTempItems', () => {
  it('resetCart clears all state', () => {
    useCartStore.setState({
      itemsIds: [{ productId: 'p1', productQuantity: 1 }],
      count: 1,
      totalPrice: 10,
      isSync: true,
      tempItems: [],
    })
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

  it('setTempItems normalizes duplicate and out-of-range item quantities', () => {
    const items = [
      makeCartItem('p1', 70),
      makeCartItem('p1', 70),
      makeCartItem('p2', -1),
    ]

    useCartStore.getState().setTempItems(items)
    const s = useCartStore.getState()

    expect(s.count).toBe(MAX_CART_ITEM_QUANTITY)
    expect(s.totalPrice).toBe(990)
    expect(s.itemsIds).toEqual([
      { productId: 'p1', productQuantity: MAX_CART_ITEM_QUANTITY },
    ])
    expect(s.tempItems).toHaveLength(1)
    expect(s.tempItems[0].productQuantity).toBe(MAX_CART_ITEM_QUANTITY)
  })
})

describe('cart store — syncSession', () => {
  it('merges guest cart into backend when authenticated', async () => {
    setClientAuthStatus('authenticated')
    useCartStore.setState({
      itemsIds: [{ productId: 'p1', productQuantity: 2 }],
      tempItems: [],
      count: 2,
      totalPrice: 0,
      isSync: false,
    })
    mockedCartApi.mergeCarts.mockResolvedValue({
      id: 'c1',
      userId: 'u1',
      createdAt: '',
      closedAt: null,
      itemsQuantity: 2,
      itemsTotalPrice: 20,
      productsQuantity: 2,
      items: [makeCartItem('p1', 2)],
    })
    await useCartStore.getState().syncSession()
    expect(useCartStore.getState().totalPrice).toBe(20)
    expect(useCartStore.getState().isSync).toBe(true)
  })

  it('normalizes stale guest quantities before backend merge', async () => {
    setClientAuthStatus('authenticated')
    useCartStore.setState({
      itemsIds: [{ productId: 'p1', productQuantity: 150 }],
      tempItems: [],
      count: 150,
      totalPrice: 0,
      isSync: false,
    })
    mockedCartApi.mergeCarts.mockResolvedValue({
      id: 'c1',
      userId: 'u1',
      createdAt: '',
      closedAt: null,
      itemsQuantity: 1,
      itemsTotalPrice: 990,
      productsQuantity: MAX_CART_ITEM_QUANTITY,
      items: [makeCartItem('p1', MAX_CART_ITEM_QUANTITY)],
    })

    await useCartStore.getState().syncSession()

    expect(mockedCartApi.mergeCarts).toHaveBeenCalledWith({
      items: [{ productId: 'p1', productQuantity: MAX_CART_ITEM_QUANTITY }],
    })
  })

  it('merges duplicate stale guest ids before backend merge', async () => {
    setClientAuthStatus('authenticated')
    useCartStore.setState({
      itemsIds: [
        { productId: 'p1', productQuantity: 60 },
        { productId: 'p1', productQuantity: 60 },
      ],
      tempItems: [],
      count: 120,
      totalPrice: 0,
      isSync: false,
    })
    mockedCartApi.mergeCarts.mockResolvedValue({
      id: 'c1',
      userId: 'u1',
      createdAt: '',
      closedAt: null,
      itemsQuantity: 1,
      itemsTotalPrice: 990,
      productsQuantity: MAX_CART_ITEM_QUANTITY,
      items: [makeCartItem('p1', MAX_CART_ITEM_QUANTITY)],
    })

    await useCartStore.getState().syncSession()

    expect(mockedCartApi.mergeCarts).toHaveBeenCalledWith({
      items: [{ productId: 'p1', productQuantity: MAX_CART_ITEM_QUANTITY }],
    })
  })

  it('loads the authenticated cart instead of merging an empty normalized guest cart', async () => {
    setClientAuthStatus('authenticated')
    useCartStore.setState({
      itemsIds: [{ productId: 'p1', productQuantity: -1 }],
      tempItems: [],
      count: -1,
      totalPrice: 0,
      isSync: false,
    })
    mockedCartApi.fetchCart.mockResolvedValue({
      id: 'c1',
      userId: 'u1',
      createdAt: '',
      closedAt: null,
      itemsQuantity: 1,
      itemsTotalPrice: 10,
      productsQuantity: 1,
      items: [makeCartItem('p2', 1)],
    })

    await useCartStore.getState().syncSession()

    expect(mockedCartApi.mergeCarts).not.toHaveBeenCalled()
    expect(mockedCartApi.fetchCart).toHaveBeenCalledTimes(1)
    expect(useCartStore.getState().itemsIds).toEqual([
      { productId: 'p2', productQuantity: 1 },
    ])
  })
})

describe('cart store — authenticated add', () => {
  it('updates state from response', async () => {
    setClientAuthStatus('authenticated')
    useCartStore.setState({
      itemsIds: [{ productId: 'p1', productQuantity: 1 }],
      tempItems: [makeCartItem('p1', 1)],
      count: 1,
      totalPrice: 10,
      isSync: true,
    })
    mockedCartApi.changeCartItemQuantity.mockResolvedValue({
      id: 'c1',
      userId: 'u1',
      createdAt: '',
      closedAt: null,
      itemsQuantity: 1,
      itemsTotalPrice: 10,
      productsQuantity: 1,
      items: [makeCartItem('p1', 1)],
    })
    useCartStore.getState().add('p1')
    await Promise.resolve()
    await Promise.resolve()
    expect(useCartStore.getState().totalPrice).toBe(10)
  })

  it('does not remove newer cart changes when an optimistic quantity update fails', async () => {
    setClientAuthStatus('authenticated')
    useCartStore.setState({
      itemsIds: [{ productId: 'p1', productQuantity: 1 }],
      tempItems: [makeCartItem('p1', 1)],
      count: 1,
      totalPrice: 10,
      isSync: true,
    })

    let rejectUpdate!: (error: Error) => void

    mockedCartApi.changeCartItemQuantity.mockReturnValue(
      new Promise((_, reject) => {
        rejectUpdate = reject
      }),
    )

    useCartStore.getState().add('p1')
    useCartStore.setState({
      itemsIds: [
        { productId: 'p1', productQuantity: 2 },
        { productId: 'p2', productQuantity: 1 },
      ],
      tempItems: [makeCartItem('p1', 2), makeCartItem('p2', 1)],
      count: 3,
      totalPrice: 30,
    })

    rejectUpdate(new Error('backend rejected update'))
    await Promise.resolve()
    await Promise.resolve()

    expect(useCartStore.getState().itemsIds).toEqual([
      { productId: 'p1', productQuantity: 1 },
      { productId: 'p2', productQuantity: 1 },
    ])
    expect(useCartStore.getState().count).toBe(2)
    expect(useCartStore.getState().totalPrice).toBe(20)
  })
})

describe('cart store — clearCart (guest)', () => {
  it('clears state without calling removeCartItem', async () => {
    useCartStore.setState({
      itemsIds: [{ productId: 'p1', productQuantity: 1 }],
      tempItems: [makeCartItem('p1')],
      count: 1,
      totalPrice: 10,
      isSync: false,
    })
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

describe('cart store — hydrate', () => {
  it('hydrates tempItems from product API', async () => {
    useCartStore.setState({
      itemsIds: [{ productId: 'p1', productQuantity: 2 }],
      tempItems: [],
      count: 2,
      totalPrice: 0,
      isSync: false,
    })
    mockedProductsApi.getProductByIds.mockResolvedValue([makeProduct('p1', 15)])
    await useCartStore.getState().hydrate()
    expect(useCartStore.getState().totalPrice).toBe(30)
  })

  it('drops unexpected product API rows during guest hydration', async () => {
    useCartStore.setState({
      itemsIds: [{ productId: 'p1', productQuantity: 2 }],
      tempItems: [],
      count: 2,
      totalPrice: 0,
      isSync: false,
    })
    mockedProductsApi.getProductByIds.mockResolvedValue([makeProduct('p2', 15)])

    await useCartStore.getState().hydrate()

    expect(useCartStore.getState().itemsIds).toHaveLength(0)
    expect(useCartStore.getState().tempItems).toHaveLength(0)
    expect(useCartStore.getState().status).toBe('ready')
  })
})
