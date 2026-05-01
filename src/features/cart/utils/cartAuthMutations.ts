import { removeCartItem } from '@/features/cart/api/cartApi'
import type { CartSliceStore } from '@/features/cart/state/cartStore'
import {
  clearPending,
  createItemsIdsFromCart,
  getProductCartSlotId,
  getProductsCount,
  getTotalPrice,
  setPending,
} from '@/features/cart/utils/cartUtils'
import type {
  StoreGet,
  StoreSet,
} from '@/features/cart/utils/cartStoreHelpers'

export function applyAuthenticatedAdd(
  set: StoreSet,
  get: StoreGet,
  id: string,
): void {
  const { itemsIds, tempItems, updateCartItem, createCart, pendingProductIds } =
    get()
  const cartItem = itemsIds.find((item) => item.productId === id)

  if (pendingProductIds.has(id)) return

  if (cartItem) {
    const productCartSlotId = getProductCartSlotId(id, tempItems)

    if (!productCartSlotId) return

    const optimisticIds = itemsIds.map((item) =>
      item.productId === id
        ? { ...item, productQuantity: item.productQuantity + 1 }
        : item,
    )
    const optimisticTemps = tempItems.map((item) =>
      item.productInfo.id === id
        ? { ...item, productQuantity: item.productQuantity + 1 }
        : item,
    )

    set({
      count: getProductsCount(optimisticIds),
      itemsIds: optimisticIds,
      tempItems: optimisticTemps,
      totalPrice: getTotalPrice(optimisticTemps),
    })
    setPending(set, id)
    updateCartItem({
      productQuantityChange: 1,
      shoppingCartItemId: productCartSlotId,
    })
      .catch(() => {
        set({
          count: getProductsCount(itemsIds),
          itemsIds,
          tempItems,
          totalPrice: getTotalPrice(tempItems),
        })
      })
      .finally(() => clearPending(set, id))
  } else {
    setPending(set, id)
    createCart({ items: [{ productId: id, productQuantity: 1 }] })
      .then(() => {}, () => {})
      .finally(() => clearPending(set, id))
  }
}

export function applyAuthenticatedRemove(
  set: StoreSet,
  get: StoreGet,
  id: string,
): void {
  const {
    tempItems,
    itemsIds,
    updateCartItem,
    removeFullProduct,
    pendingProductIds,
  } = get()

  if (pendingProductIds.has(id)) return

  const productCartSlotId = getProductCartSlotId(id, tempItems)

  if (!productCartSlotId) return

  const currentItem = tempItems.find((item) => item.productInfo.id === id)

  if (currentItem && currentItem.productQuantity <= 1) {
    removeFullProduct(id)

    return
  }

  const optimisticIds = itemsIds.map((item) =>
    item.productId === id
      ? { ...item, productQuantity: item.productQuantity - 1 }
      : item,
  )
  const optimisticTemps = tempItems.map((item) =>
    item.productInfo.id === id
      ? { ...item, productQuantity: item.productQuantity - 1 }
      : item,
  )

  set({
    count: getProductsCount(optimisticIds),
    itemsIds: optimisticIds,
    tempItems: optimisticTemps,
    totalPrice: getTotalPrice(optimisticTemps),
  })
  setPending(set, id)
  updateCartItem({
    productQuantityChange: -1,
    shoppingCartItemId: productCartSlotId,
  })
    .catch(() => {
      set({
        count: getProductsCount(itemsIds),
        itemsIds,
        tempItems,
        totalPrice: getTotalPrice(tempItems),
      })
    })
    .finally(() => clearPending(set, id))
}

export function applyAuthenticatedRemoveFullProduct(
  set: StoreSet,
  get: StoreGet,
  id: string,
): void {
  const { tempItems, pendingProductIds } = get()

  if (pendingProductIds.has(id)) return

  const productCartSlotId = getProductCartSlotId(id, tempItems)

  if (!productCartSlotId) return

  setPending(set, id)
  removeCartItem([productCartSlotId])
    .then((data) => {
      const { itemsTotalPrice, productsQuantity, items } = data

      set({
        count: productsQuantity,
        itemsIds: createItemsIdsFromCart(items),
        tempItems: items,
        totalPrice: itemsTotalPrice,
      } as Partial<CartSliceStore>)
    })
    .catch((err) => {
      const message = err instanceof Error ? err.message : 'Failed to remove item'

      set({ lastError: message, status: 'error' })
    })
    .finally(() => clearPending(set, id))
}
