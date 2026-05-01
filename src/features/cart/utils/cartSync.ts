import { getProductByIds } from '@/features/products/public'
import {
  changeCartItemQuantity,
  fetchCart,
  mergeCarts,
} from '@/features/cart/api/cartApi'
import type {
  ICartItem,
  ICartPushItem,
  ICartUpdatedItem,
} from '@/features/cart/types/cartTypes'
import {
  createItemsIdsFromCart,
  getProductsCount,
  getTotalPrice,
} from '@/features/cart/utils/cartUtils'
import type { CartSliceStore } from '@/features/cart/state/cartStore'
import type { StoreGet } from '@/features/cart/utils/cartStoreHelpers'

export async function loadAuthCartIntoStore(
  set: (partial: Partial<CartSliceStore>) => void,
  get: StoreGet,
  signal?: AbortSignal,
): Promise<void> {
  set({ status: 'loading', lastError: null })

  try {
    const cart = await fetchCart(signal)

    if (signal?.aborted) return

    const currentIds = get().itemsIds

    if (cart.items.length === 0 && currentIds.length > 0 && !get().isSync) {
      set({ lastError: null, status: 'ready' })

      return
    }

    set({
      count: cart.productsQuantity,
      isSync: cart.items.length > 0,
      itemsIds: createItemsIdsFromCart(cart.items),
      lastError: null,
      status: 'ready',
      tempItems: cart.items,
      totalPrice: cart.itemsTotalPrice,
    })
  } catch (err) {
    if (
      (err as { name?: string }).name === 'AbortError' ||
      (err as { name?: string }).name === 'CanceledError'
    ) {
      return
    }

    const message = err instanceof Error ? err.message : 'Failed to load cart'

    set({ lastError: message, status: 'error' })
  }
}

export async function loadGuestCartItemsIntoStore(
  set: (partial: Partial<CartSliceStore>) => void,
  get: StoreGet,
): Promise<void> {
  set({ status: 'loading', lastError: null })

  try {
    const { itemsIds } = get()
    const ids = itemsIds.map((item) => item.productId)
    const productList = await getProductByIds(ids)
    const cartItems: ICartItem[] = productList.map((item) => ({
      id: item.id,
      productInfo: { ...item },
      productQuantity: itemsIds.find((cartItem) => cartItem.productId === item.id)!
        .productQuantity,
    }))
    const reconciledIds = cartItems.map((item) => ({
      productId: item.productInfo.id,
      productQuantity: item.productQuantity,
    }))

    set({
      count: getProductsCount(reconciledIds),
      itemsIds: reconciledIds,
      lastError: null,
      status: 'ready',
      tempItems: cartItems,
      totalPrice: getTotalPrice(cartItems),
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to load cart'

    set({ lastError: message, status: 'error' })
  }
}

export async function syncBackendCartIntoStore(get: StoreGet): Promise<void> {
  const { createCart, itemsIds } = get()

  await createCart({ items: itemsIds })
}

export async function mergeCartsIntoStore(
  set: (partial: Partial<CartSliceStore>) => void,
  reqItems: { items: ICartPushItem[] },
): Promise<void> {
  set({ status: 'syncing' })

  try {
    const mergedCart = await mergeCarts(reqItems)
    const { itemsTotalPrice, productsQuantity, items } = mergedCart

    set({
      count: productsQuantity,
      isSync: true,
      itemsIds: createItemsIdsFromCart(items),
      status: 'ready',
      tempItems: items,
      totalPrice: itemsTotalPrice,
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to update cart'

    set({ lastError: message, status: 'error' })
    throw err
  }
}

export async function updateCartItemInStore(
  set: (partial: Partial<CartSliceStore>) => void,
  updatedItem: ICartUpdatedItem,
): Promise<void> {
  set({ status: 'syncing' })

  try {
    const data = await changeCartItemQuantity(updatedItem)
    const { itemsTotalPrice, productsQuantity, items } = data
    const filteredItems = items.filter((item) => item.productQuantity > 0)

    set({
      count: productsQuantity,
      itemsIds: createItemsIdsFromCart(filteredItems),
      status: 'ready',
      tempItems: filteredItems,
      totalPrice: itemsTotalPrice,
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to update cart'

    set({ lastError: message, status: 'error' })
    throw err
  }
}
