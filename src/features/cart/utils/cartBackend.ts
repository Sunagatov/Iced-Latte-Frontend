import { getProductByIds } from '@/features/products/api'
import {
  changeCartItemQuantity,
  fetchCart,
  mergeCarts,
  removeCartItem,
} from '@/features/cart/api/cartApi'
import type {
  ICartItem,
  ICartPushItem,
  ICartUpdatedItem,
} from '@/features/cart/types/cartTypes'
import {
  clearPending,
  createItemsIdsFromCart,
  getProductCartSlotId,
  getProductsCount,
  getTotalPrice,
  setPending,
} from '@/features/cart/utils/cartUtils'
import type { CartSliceStore } from '@/features/cart/state/cartStore'

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
      })
    })
    .catch((err) => {
      const message = err instanceof Error ? err.message : 'Failed to remove item'

      set({ lastError: message, status: 'error' })
    })
    .finally(() => clearPending(set, id))
}
