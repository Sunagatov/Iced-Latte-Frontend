import { renderHook } from '@testing-library/react'
import { useCartStore } from '@/features/cart/cartStore'
import { useFavouritesStore } from '@/features/favorites/state/favoritesStore'
import { useFavoriteProductActions } from '@/features/favorites/useFavoriteProductActions'

const PRODUCT_ID = '418499f3-d951-40bf-9414-5cb90ab21ecb'

describe('useFavoriteProductActions', () => {
  beforeEach(() => {
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
})
