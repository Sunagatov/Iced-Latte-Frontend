'use client'

import { useEffect, useRef } from 'react'

import {
  useCartStore,
  type CartSliceStore,
  MAX_CART_ITEM_QUANTITY,
} from '@/features/cart/public'
import {
  buildGoogleAnalyticsItem,
  trackGoogleAnalyticsEvent,
} from '@/shared/analytics/googleAnalytics'
import {
  type FavStoreState,
  useFavouritesStore,
} from '@/features/favorites/state/favoritesStore'
import { getClientAuthStatus } from '@/shared/auth/sessionStatus'

type ProductAnalyticsInfo = {
  brandName?: string | null
  name?: string
  price?: number
}

function buildAnalyticsItemList(
  productId: string,
  product?: ProductAnalyticsInfo,
  quantity = 1,
) {
  if (product?.name && product.price != null) {
    return [
      buildGoogleAnalyticsItem({
        brandName: product.brandName,
        id: productId,
        name: product.name,
        price: product.price,
        quantity,
      }),
    ]
  }

  return [{ item_id: productId, quantity }]
}

type PendingCartAnalyticsAction = {
  baselineQuantity: number
  type: 'add' | 'remove' | 'remove_full'
}

export function useFavoriteProductActions(
  productId: string,
  product?: ProductAnalyticsInfo,
) {
  const toggleFavourite = useFavouritesStore(
    (state: FavStoreState): FavStoreState['toggleFavourite'] =>
      state.toggleFavourite,
  )
  const favouriteIds = useFavouritesStore(
    (state: FavStoreState): string[] => state.favouriteIds,
  )
  const pendingIds = useFavouritesStore(
    (state: FavStoreState): Set<string> => state.pendingIds,
  )
  const add = useCartStore(
    (state: CartSliceStore): CartSliceStore['add'] => state.add,
  )
  const remove = useCartStore(
    (state: CartSliceStore): CartSliceStore['remove'] => state.remove,
  )
  const removeFullProduct = useCartStore(
    (state: CartSliceStore): CartSliceStore['removeFullProduct'] =>
      state.removeFullProduct,
  )
  const items = useCartStore(
    (state: CartSliceStore): CartSliceStore['itemsIds'] => state.itemsIds,
  )
  const pendingProductIds = useCartStore(
    (state: CartSliceStore): CartSliceStore['pendingProductIds'] =>
      state.pendingProductIds,
  )

  const quantity =
    items.find((item) => item.productId === productId)?.productQuantity ?? 0
  const isFavourited = favouriteIds.includes(productId)
  const isPending = pendingIds.has(productId)
  const isCartPending = pendingProductIds.has(productId)
  const authStatus = getClientAuthStatus()
  const pendingCartAnalyticsRef = useRef<PendingCartAnalyticsAction | null>(
    null,
  )

  useEffect(() => {
    if (authStatus !== 'authenticated') {
      pendingCartAnalyticsRef.current = null
      return
    }

    if (isCartPending) {
      return
    }

    const pendingAction = pendingCartAnalyticsRef.current

    if (!pendingAction) {
      return
    }

    pendingCartAnalyticsRef.current = null

    if (pendingAction.type === 'add') {
      const delta = quantity - pendingAction.baselineQuantity

      if (delta > 0) {
        trackGoogleAnalyticsEvent('add_to_cart', {
          currency: 'USD',
          items: buildAnalyticsItemList(productId, product, delta),
        })
      }

      return
    }

    const delta = pendingAction.baselineQuantity - quantity

    if (delta <= 0) {
      return
    }

    trackGoogleAnalyticsEvent('remove_from_cart', {
      currency: 'USD',
      items: buildAnalyticsItemList(productId, product, delta),
    })
  }, [authStatus, isCartPending, product, productId, quantity])

  const handleToggleFavourite = async (): Promise<void> => {
    if (isPending) {
      return
    }

    const shouldTrackAsAdd = !isFavourited

    try {
      await toggleFavourite(productId)
      trackGoogleAnalyticsEvent(
        shouldTrackAsAdd ? 'add_to_wishlist' : 'remove_from_wishlist',
        {
          items: buildAnalyticsItemList(productId, product),
        },
      )
    } catch {
      return
    }
  }

  return {
    addToCart: () => {
      if (isCartPending || quantity >= MAX_CART_ITEM_QUANTITY) {
        return
      }

      add(productId)

      if (authStatus === 'authenticated') {
        pendingCartAnalyticsRef.current = {
          baselineQuantity: quantity,
          type: 'add',
        }
        return
      }

      trackGoogleAnalyticsEvent('add_to_cart', {
        currency: 'USD',
        items: buildAnalyticsItemList(productId, product),
      })
    },
    decreaseCartQuantity: () => {
      if (isCartPending || quantity <= 0) {
        return
      }

      remove(productId)

      if (authStatus === 'authenticated') {
        pendingCartAnalyticsRef.current = {
          baselineQuantity: quantity,
          type: 'remove',
        }
        return
      }

      trackGoogleAnalyticsEvent('remove_from_cart', {
        currency: 'USD',
        items: buildAnalyticsItemList(productId, product),
      })
    },
    handleToggleFavourite,
    isCartPending,
    isFavourited,
    isPending,
    quantity,
    removeFromCart: () => {
      if (isCartPending || quantity <= 0) {
        return
      }

      removeFullProduct(productId)

      if (authStatus === 'authenticated') {
        pendingCartAnalyticsRef.current = {
          baselineQuantity: quantity,
          type: 'remove_full',
        }
        return
      }

      trackGoogleAnalyticsEvent('remove_from_cart', {
        currency: 'USD',
        items: buildAnalyticsItemList(productId, product, quantity),
      })
    },
  }
}
