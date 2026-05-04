import type {
  ICartItem,
  ICartPushItem,
} from '@/features/cart/cartTypes'
import { createItemsIdsFromCart } from '@/features/cart/utils/cartUtils'

export type CartStatus = 'idle' | 'loading' | 'syncing' | 'ready' | 'error'

export type CartStoreState = {
  count: number
  isSync: boolean
  itemsIds: ICartPushItem[]
  lastError: string | null
  pendingProductIds: Set<string>
  status: CartStatus
  tempItems: ICartItem[]
  totalPrice: number
}

type CartStoreMethods = {
  hydrate: (signal?: AbortSignal) => Promise<void>
}

export type StoreSet = {
  (partial: Partial<CartStoreState>): void
  (fn: (state: CartStoreState) => Partial<CartStoreState>): void
}

export type StoreGet = () => CartStoreState & CartStoreMethods

export function getCartSnapshot(items: ICartItem[]): Pick<
  CartStoreState,
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
  set: StoreSet,
  items: ICartItem[],
  overrides?: Partial<CartStoreState>,
): void {
  set({
    ...getCartSnapshot(items),
    ...overrides,
  })
}

export function setCartError(
  set: StoreSet,
  fallbackMessage: string,
  err: unknown,
): void {
  const message = err instanceof Error ? err.message : fallbackMessage

  set({ lastError: message, status: 'error' })
}
