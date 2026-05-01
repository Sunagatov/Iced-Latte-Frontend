import {
  changeCartItemQuantity,
  mergeCarts,
  removeCartItem,
} from '@/features/cart/api/cartApi'
import type {
  ICartItem,
  ICartPushItem,
  ICartUpdatedItem,
} from '@/features/cart/types/cartTypes'
import {
  setCartError,
  setCartItems,
  type StoreGet,
  type StoreSet,
} from '@/features/cart/utils/cartStoreHelpers'
import {
  addToCart,
  clearPending,
  getProductCartSlotId,
  getProductsCount,
  getTotalPrice,
  removeItem,
  setPending,
} from '@/features/cart/utils/cartUtils'

const MAX_CART_ITEM_QUANTITY = 99

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

  void get().hydrate().catch(() => {})
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

export function applyAuthenticatedAdd(
  set: StoreSet,
  get: StoreGet,
  productId: string,
): void {
  const { itemsIds, tempItems, pendingProductIds } = get()
  const cartItem = itemsIds.find((item) => item.productId === productId)

  if (cartItem && cartItem.productQuantity >= MAX_CART_ITEM_QUANTITY) return
  if (pendingProductIds.has(productId)) return

  if (!cartItem) {
    setPending(set, productId)
    void mergeGuestCartIntoBackend(set, [{ productId, productQuantity: 1 }])
      .catch(() => {})
      .finally(() => clearPending(set, productId))

    return
  }

  const shoppingCartItemId = getProductCartSlotId(productId, tempItems)

  if (!shoppingCartItemId) return

  const optimisticIds = itemsIds.map((item) =>
    item.productId === productId
      ? { ...item, productQuantity: item.productQuantity + 1 }
      : item,
  )
  const optimisticItems = tempItems.map((item) =>
    item.productInfo.id === productId
      ? { ...item, productQuantity: item.productQuantity + 1 }
      : item,
  )

  set({
    count: getProductsCount(optimisticIds),
    itemsIds: optimisticIds,
    tempItems: optimisticItems,
    totalPrice: getTotalPrice(optimisticItems),
  })
  setPending(set, productId)

  void updateBackendCartItem(set, {
    productQuantityChange: 1,
    shoppingCartItemId,
  })
    .catch(() => {
      set({
        count: getProductsCount(itemsIds),
        itemsIds,
        tempItems,
        totalPrice: getTotalPrice(tempItems),
      })
    })
    .finally(() => clearPending(set, productId))
}

export function applyAuthenticatedRemove(
  set: StoreSet,
  get: StoreGet,
  productId: string,
): void {
  const { itemsIds, tempItems, pendingProductIds } = get()

  if (pendingProductIds.has(productId)) return

  const shoppingCartItemId = getProductCartSlotId(productId, tempItems)

  if (!shoppingCartItemId) return

  const currentItem = tempItems.find((item) => item.productInfo.id === productId)

  if (currentItem && currentItem.productQuantity <= 1) {
    applyAuthenticatedRemoveFullProduct(set, get, productId)

    return
  }

  const optimisticIds = itemsIds.map((item) =>
    item.productId === productId
      ? { ...item, productQuantity: item.productQuantity - 1 }
      : item,
  )
  const optimisticItems = tempItems.map((item) =>
    item.productInfo.id === productId
      ? { ...item, productQuantity: item.productQuantity - 1 }
      : item,
  )

  set({
    count: getProductsCount(optimisticIds),
    itemsIds: optimisticIds,
    tempItems: optimisticItems,
    totalPrice: getTotalPrice(optimisticItems),
  })
  setPending(set, productId)

  void updateBackendCartItem(set, {
    productQuantityChange: -1,
    shoppingCartItemId,
  })
    .catch(() => {
      set({
        count: getProductsCount(itemsIds),
        itemsIds,
        tempItems,
        totalPrice: getTotalPrice(tempItems),
      })
    })
    .finally(() => clearPending(set, productId))
}

export function applyAuthenticatedRemoveFullProduct(
  set: StoreSet,
  get: StoreGet,
  productId: string,
): void {
  const { tempItems, pendingProductIds } = get()

  if (pendingProductIds.has(productId)) return

  const shoppingCartItemId = getProductCartSlotId(productId, tempItems)

  if (!shoppingCartItemId) return

  setPending(set, productId)

  void removeCartItem([shoppingCartItemId])
    .then((cart) => {
      setCartItems(set, cart.items, {
        count: cart.productsQuantity,
        status: 'ready',
      })
    })
    .catch((err) => setCartError(set, 'Failed to remove item', err))
    .finally(() => clearPending(set, productId))
}

export async function clearCartStore(
  set: StoreSet,
  get: StoreGet,
  isAuthenticated: boolean,
): Promise<void> {
  const { tempItems, isSync } = get()

  set({ status: 'syncing' })

  try {
    if (isAuthenticated && isSync && tempItems.length > 0) {
      await removeCartItem(tempItems.map((item) => item.id))
    }

    set({
      count: 0,
      isSync: isAuthenticated,
      itemsIds: [],
      lastError: null,
      pendingProductIds: new Set(),
      status: 'ready',
      tempItems: [],
      totalPrice: 0,
    })
  } catch (err) {
    setCartError(set, 'Failed to clear cart', err)
  }
}

export async function mergeGuestCartIntoBackend(
  set: StoreSet,
  items: ICartPushItem[],
): Promise<void> {
  set({ status: 'syncing' })

  try {
    const mergedCart = await mergeCarts({ items })

    setCartItems(set, mergedCart.items, {
      count: mergedCart.productsQuantity,
      isSync: true,
      status: 'ready',
      totalPrice: mergedCart.itemsTotalPrice,
    })
  } catch (err) {
    setCartError(set, 'Failed to update cart', err)
    throw err
  }
}

export async function updateBackendCartItem(
  set: StoreSet,
  updatedItem: ICartUpdatedItem,
): Promise<void> {
  set({ status: 'syncing' })

  try {
    const cart = await changeCartItemQuantity(updatedItem)
    const filteredItems = cart.items.filter((item) => item.productQuantity > 0)

    setCartItems(set, filteredItems, {
      count: cart.productsQuantity,
      status: 'ready',
      totalPrice: cart.itemsTotalPrice,
    })
  } catch (err) {
    setCartError(set, 'Failed to update cart', err)
    throw err
  }
}
