import type { CartSet, CartState } from '@/features/cart/cart.service.types'
import type { ICartItem } from '@/features/cart/types/cartTypes'
import { createItemsIdsFromCart } from '@/features/cart/utils/cartUtils'

export function getCartSnapshot(items: ICartItem[]): Pick<
  CartState,
  'count' | 'itemsIds' | 'tempItems' | 'totalPrice'
> {
  return {
    count: items.reduce((sum, item) => sum + item.productQuantity, 0),
    itemsIds: createItemsIdsFromCart(items),
    tempItems: items,
    totalPrice: items.reduce(
      (sum, item) => sum + item.productInfo.price * item.productQuantity,
      0,
    ),
  }
}

export function setCartItems(
  set: CartSet,
  items: ICartItem[],
  overrides?: Partial<CartState>,
): void {
  set({
    ...getCartSnapshot(items),
    ...overrides,
  })
}

export function setCartError(
  set: CartSet,
  fallbackMessage: string,
  err: unknown,
): void {
  const message = err instanceof Error ? err.message : fallbackMessage

  set({ lastError: message, status: 'error' })
}
