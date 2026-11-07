import {
  changeCartItemQuantity,
  mergeCarts,
  removeCartItem,
} from '@/features/cart/cartApi'
import type { ICartPushItem } from '@/features/cart/cartTypes'
import {
  setCartError,
  type StoreGet,
  type StoreSet,
} from '@/features/cart/utils/cartStoreHelpers'
import {
  addToCart,
  clearPending,
  getProductsCount,
  getTotalPrice,
  MAX_CART_ITEM_QUANTITY,
  normalizeCartItems,
  removeItem,
  setPending,
} from '@/features/cart/utils/cartUtils'

export function applyGuestAdd(
  set: StoreSet,
  get: StoreGet,
  productId: string,
): void {
  const { itemsIds, tempItems, pendingProductIds, totalPrice } = get()
  const cartItem = itemsIds.find((item) => item.productId === productId)

  if (cartItem && cartItem.productQuantity >= MAX_CART_ITEM_QUANTITY) return
  if (pendingProductIds.has(productId)) return

  const updatedCart = addToCart(productId, itemsIds)
  const updatedTempItems = cartItem
    ? tempItems.map((tempItem) =>
      tempItem.productInfo.id === productId
        ? { ...tempItem, productQuantity: tempItem.productQuantity + 1 }
        : tempItem,
    )
    : tempItems

  set({
    count: getProductsCount(updatedCart),
    itemsIds: updatedCart,
    tempItems: updatedTempItems,
    totalPrice: cartItem ? getTotalPrice(updatedTempItems) : totalPrice,
  })

  void get()
    .hydrate()
    .catch(() => {})
}

export function applyGuestRemove(
  set: StoreSet,
  get: StoreGet,
  productId: string,
): void {
  const { itemsIds, tempItems } = get()
  const updatedCart = removeItem(productId, itemsIds)
  const updatedTempItems = tempItems
    .map((tempItem) =>
      tempItem.productInfo.id === productId
        ? { ...tempItem, productQuantity: tempItem.productQuantity - 1 }
        : tempItem,
    )
    .filter((tempItem) => tempItem.productQuantity > 0)

  set({
    count: getProductsCount(updatedCart),
    itemsIds: updatedCart,
    tempItems: updatedTempItems,
    totalPrice: getTotalPrice(updatedTempItems),
  })
}

export function applyGuestRemoveFullProduct(
  set: StoreSet,
  get: StoreGet,
  productId: string,
): void {
  const { itemsIds, tempItems } = get()
  const updatedCart = itemsIds.filter((item) => item.productId !== productId)
  const remainingItems = tempItems.filter(
    (item) => item.productInfo.id !== productId,
  )

  set({
    count: getProductsCount(updatedCart),
    itemsIds: updatedCart,
    tempItems: remainingItems,
    totalPrice: getTotalPrice(remainingItems),
  })
}

// Authenticated data is published by the command gateway. These handlers own
// pending indicators and errors only; they never infer or roll back server data.
async function runCartWrite(
  set: StoreSet,
  ids: string[],
  work: () => Promise<unknown>,
) {
  ids.forEach((id) => setPending(set, id))
  set({ status: 'syncing', lastError: null })
  try {
    await work()
  } catch (error) {
    setCartError(set, 'Failed to update cart', error)
  } finally {
    ids.forEach((id) => clearPending(set, id))
    set((state) => ({
      status:
        state.status === 'error'
          ? 'error'
          : state.pendingProductIds.size
            ? 'syncing'
            : 'ready',
    }))
  }
}

export function applyAuthenticatedAdd(
  set: StoreSet,
  get: StoreGet,
  productId: string,
): void | Promise<void> {
  const current = get()
  const item = current.tempItems.find((row) => row.productInfo.id === productId)

  if (
    current.pendingProductIds.has(productId) ||
    (item?.productQuantity ?? 0) >= MAX_CART_ITEM_QUANTITY
  )
    return

  return runCartWrite(set, [productId], () =>
    item
      ? changeCartItemQuantity({
        productId,
        shoppingCartItemId: item.id,
        productQuantityChange: 1,
      })
      : mergeCarts({ items: [{ productId, productQuantity: 1 }] }),
  )
}

export function applyAuthenticatedRemove(
  set: StoreSet,
  get: StoreGet,
  productId: string,
): void | Promise<void> {
  const current = get()
  const item = current.tempItems.find((row) => row.productInfo.id === productId)

  if (!item || current.pendingProductIds.has(productId)) return
  if (item.productQuantity <= 1)
    return applyAuthenticatedRemoveFullProduct(set, get, productId)

  return runCartWrite(set, [productId], () =>
    changeCartItemQuantity({
      productId,
      shoppingCartItemId: item.id,
      productQuantityChange: -1,
    }),
  )
}

export function applyAuthenticatedRemoveFullProduct(
  set: StoreSet,
  get: StoreGet,
  productId: string,
): void | Promise<void> {
  if (get().pendingProductIds.has(productId)) return
  const item = get().tempItems.find((row) => row.productInfo.id === productId)

  if (!item) return

  return runCartWrite(set, [productId], () =>
    removeCartItem([item.id], [productId]),
  )
}

export async function clearCartStore(
  set: StoreSet,
  get: StoreGet,
  authenticated: boolean,
  productIds?: Set<string>,
) {
  const ids =
    productIds ?? new Set(get().itemsIds.map((item) => item.productId))

  if (authenticated) {
    if (ids.size)
      await runCartWrite(set, [...ids], () =>
        removeCartItem(
          get()
            .tempItems.filter((item) => ids.has(item.productInfo.id))
            .map((item) => item.id),
          [...ids],
        ),
      )

    return
  }
  const itemsIds = get().itemsIds.filter((item) => !ids.has(item.productId))
  const tempItems = get().tempItems.filter(
    (item) => !ids.has(item.productInfo.id),
  )

  set({
    itemsIds,
    tempItems,
    count: getProductsCount(itemsIds),
    totalPrice: getTotalPrice(tempItems),
    status: 'ready',
  })
}

export async function mergeGuestCartIntoBackend(
  set: StoreSet,
  items: ICartPushItem[],
  signal?: AbortSignal,
  operationId?: string,
) {
  if (signal?.aborted) return
  set({ status: 'syncing' })
  try {
    await mergeCarts({ items: normalizeCartItems(items) }, signal, operationId)
    if (signal?.aborted) return
    set({
      isSync: true,
      pendingMerge: null,
      guestConflict: null,
      lastError: null,
      status: 'ready',
    })
  } catch (error) {
    if (signal?.aborted || (error as Error).name === 'CanceledError') return
    setCartError(set, 'Failed to update cart', error)
    throw error
  }
}
