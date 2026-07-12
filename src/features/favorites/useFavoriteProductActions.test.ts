import { act, renderHook } from '@testing-library/react'
import { MAX_CART_ITEM_QUANTITY, useCartStore } from '@/features/cart/public'
import { useFavouritesStore } from '@/features/favorites/public'
import { trackGoogleAnalyticsEvent } from '@/shared/analytics/googleAnalytics'
import { useFavoriteProductActions } from '@/features/favorites/useFavoriteProductActions'

jest.mock('@/shared/analytics/googleAnalytics', () => ({
  __esModule: true,
  trackGoogleAnalyticsEvent: jest.fn(),
}))

const PRODUCT_ID = '418499f3-d951-40bf-9414-5cb90ab21ecb'
const mockedTrackGoogleAnalyticsEvent = jest.mocked(trackGoogleAnalyticsEvent)

describe('useFavoriteProductActions', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    useCartStore.setState({
      count: 0,
      isSync: false,
      itemsIds: [],
      pendingProductIds: new Set(),
      tempItems: [],
      totalPrice: 0,
    })
    useFavouritesStore.setState({
      favouriteIds: [PRODUCT_ID],
      favourites: [],
      isSync: false,
      pendingIds: new Set(),
      status: 'ready',
    })
  })

  it('reports cart pending state for the favourite product', () => {
    useCartStore.setState({ pendingProductIds: new Set([PRODUCT_ID]) })

    const { result } = renderHook(() => useFavoriteProductActions(PRODUCT_ID))

    expect(result.current.isCartPending).toBe(true)
  })

  it('tracks add to cart with a minimal analytics item when product details are unavailable', () => {
    const { result } = renderHook(() => useFavoriteProductActions(PRODUCT_ID))

    act(() => {
      result.current.addToCart()
    })

    expect(mockedTrackGoogleAnalyticsEvent).toHaveBeenCalledWith(
      'add_to_cart',
      {
        currency: 'USD',
        items: [{ item_id: PRODUCT_ID, quantity: 1 }],
      },
    )
  })

  it('does not track add to cart when the item is already at the quantity limit', () => {
    useCartStore.setState({
      count: MAX_CART_ITEM_QUANTITY,
      itemsIds: [{ productId: PRODUCT_ID, productQuantity: MAX_CART_ITEM_QUANTITY }],
      tempItems: [
        {
          id: PRODUCT_ID,
          productInfo: {
            id: PRODUCT_ID,
            name: 'Cold Brew',
            price: 12.5,
          },
          productQuantity: MAX_CART_ITEM_QUANTITY,
        },
      ],
    })

    const { result } = renderHook(() =>
      useFavoriteProductActions(PRODUCT_ID, {
        name: 'Cold Brew',
        price: 12.5,
      }),
    )

    act(() => {
      result.current.addToCart()
    })

    expect(mockedTrackGoogleAnalyticsEvent).not.toHaveBeenCalled()
  })
})
