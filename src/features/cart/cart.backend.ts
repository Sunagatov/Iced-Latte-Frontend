import { ICartItem, ICartPushItem, ICartUpdatedItem } from './types'
import {
  mergeCarts,
  removeCartItem,
  changeCartItemQuantity,
  fetchCart,
} from './api'
import { getProductByIds } from '@/features/products/api'
import {
  getProductsCount,
  getTotalPrice,
  getProductCartSlotId,
  createItemsIdsFromCart,
  setPending,
  clearPending,
} from './cart.utils'
import type { CartSliceStore } from './store'

type StoreSet = {
  (partial: Partial<CartSliceStore>): void
  (fn: (s: CartSliceStore) => Partial<CartSliceStore>): void
}
type StoreGet = () => CartSliceStore

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
      set({ status: 'ready', lastError: null })

      return
    }

    set({
      itemsIds: createItemsIdsFromCart(cart.items),
      tempItems: cart.items,
      count: cart.productsQuantity,
      totalPrice: cart.itemsTotalPrice,
      isSync: cart.items.length > 0,
      status: 'ready',
      lastError: null,
    })
  } catch (err) {
    if ((err as { name?: string }).name === 'AbortError' || (err as { name?: string }).name === 'CanceledError') {
      return
    }

    const message = err instanceof Error ? err.message : 'Failed to load cart'

    set({ status: 'error', lastError: message })
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
      productQuantity: itemsIds.find((i) => i.productId === item.id)!.productQuantity,
    }))
    const reconciledIds = cartItems.map((i) => ({
      productId: i.productInfo.id,
      productQuantity: i.productQuantity,
    }))

    set({
      tempItems: cartItems,
      itemsIds: reconciledIds,
      count: getProductsCount(reconciledIds),
      totalPrice: getTotalPrice(cartItems),
      status: 'ready',
      lastError: null,
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to load cart'

    set({ status: 'error', lastError: message })
  }
}

export async function syncBackendCartIntoStore(
  get: StoreGet,
): Promise<void> {
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
      itemsIds: createItemsIdsFromCart(items),
      tempItems: items,
      count: productsQuantity,
      totalPrice: itemsTotalPrice,
      isSync: true,
      status: 'ready',
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to update cart'

    set({ status: 'error', lastError: message })
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
      itemsIds: createItemsIdsFromCart(filteredItems),
      tempItems: filteredItems,
      count: productsQuantity,
      totalPrice: itemsTotalPrice,
      status: 'ready',
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to update cart'

    set({ status: 'error', lastError: message })
    throw err
  }
}

export function applyAuthenticatedAdd(
  set: StoreSet,
  get: StoreGet,
  id: string,
): void {
  const { itemsIds, tempItems, updateCartItem, createCart, pendingProductIds } = get()
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
      itemsIds: optimisticIds,
      tempItems: optimisticTemps,
      count: getProductsCount(optimisticIds),
      totalPrice: getTotalPrice(optimisticTemps),
    })
    setPending(set, id)
    updateCartItem({ shoppingCartItemId: productCartSlotId, productQuantityChange: 1 })
      .catch(() => {
        set({
          itemsIds,
          tempItems,
          count: getProductsCount(itemsIds),
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
  const { tempItems, itemsIds, updateCartItem, removeFullProduct, pendingProductIds } = get()

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
    itemsIds: optimisticIds,
    tempItems: optimisticTemps,
    count: getProductsCount(optimisticIds),
    totalPrice: getTotalPrice(optimisticTemps),
  })
  setPending(set, id)
  updateCartItem({ shoppingCartItemId: productCartSlotId, productQuantityChange: -1 })
    .catch(() => {
      set({
        itemsIds,
        tempItems,
        count: getProductsCount(itemsIds),
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
        itemsIds: createItemsIdsFromCart(items),
        tempItems: items,
        count: productsQuantity,
        totalPrice: itemsTotalPrice,
      })
    })
    .catch((err) => {
      const message = err instanceof Error ? err.message : 'Failed to remove item'

      set({ status: 'error', lastError: message })
    })
    .finally(() => clearPending(set, id))
}
