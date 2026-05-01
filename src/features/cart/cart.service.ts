import { useAuthStore } from '@/features/auth/store'
import {
  changeCartItemQuantity,
  fetchCart,
  mergeCarts,
  removeCartItem,
} from '@/features/cart/api/cartApi'
import { getProductByIds } from '@/features/products/public'
import type {
  ICartItem,
  ICartPushItem,
  ICartUpdatedItem,
} from '@/features/cart/types/cartTypes'
import {
  addToCart,
  clearPending,
  createItemsIdsFromCart,
  getProductCartSlotId,
  getProductsCount,
  getTotalPrice,
  removeItem,
  setPending,
} from '@/features/cart/utils/cartUtils'

type CartStatus = 'idle' | 'loading' | 'syncing' | 'ready' | 'error'

type CartState = {
  count: number
  isSync: boolean
  itemsIds: ICartPushItem[]
  lastError: string | null
  pendingProductIds: Set<string>
  status: CartStatus
  tempItems: ICartItem[]
  totalPrice: number
}

type CartSet = {
  (partial: Partial<CartState>): void
  (fn: (state: CartState) => Partial<CartState>): void
}

type CartGet = () => CartState & {
  hydrate: (signal?: AbortSignal) => Promise<void>
}

const MAX_CART_ITEM_QUANTITY = 99

function setCartItems(
  set: CartSet,
  items: ICartItem[],
  overrides?: Partial<CartState>,
): void {
  set({
    count: items.reduce((sum, item) => sum + item.productQuantity, 0),
    itemsIds: createItemsIdsFromCart(items),
    tempItems: items,
    totalPrice: items.reduce(
      (sum, item) => sum + item.productInfo.price * item.productQuantity,
      0,
    ),
    ...overrides,
  })
}

function setCartError(set: CartSet, fallbackMessage: string, err: unknown): void {
  const message = err instanceof Error ? err.message : fallbackMessage

  set({ lastError: message, status: 'error' })
}

function isAbortError(err: unknown): boolean {
  return (
    (err as { name?: string }).name === 'AbortError' ||
    (err as { name?: string }).name === 'CanceledError'
  )
}

export function applyGuestAdd(set: CartSet, get: CartGet, productId: string): void {
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

export function applyGuestRemove(set: CartSet, get: CartGet, productId: string): void {
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
  set: CartSet,
  get: CartGet,
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
  set: CartSet,
  get: CartGet,
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
  set: CartSet,
  get: CartGet,
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
  set: CartSet,
  get: CartGet,
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

export async function hydrateCartStore(
  set: CartSet,
  get: CartGet,
  signal?: AbortSignal,
): Promise<void> {
  const authStatus = useAuthStore.getState().status

  if (authStatus === 'authenticated') {
    await loadAuthenticatedCart(set, get, signal)

    return
  }

  await loadGuestCart(set, get)
}

export async function syncCartStoreWithSession(
  set: CartSet,
  get: CartGet,
  signal?: AbortSignal,
): Promise<void> {
  const authStatus = useAuthStore.getState().status

  if (authStatus === 'anonymous') {
    if (get().isSync) {
      set({
        count: 0,
        isSync: false,
        itemsIds: [],
        lastError: null,
        pendingProductIds: new Set(),
        status: 'idle',
        tempItems: [],
        totalPrice: 0,
      })

      return
    }

    if (get().itemsIds.length > 0) {
      await loadGuestCart(set, get)
    }

    return
  }

  if (!get().isSync && get().itemsIds.length > 0) {
    await mergeGuestCartIntoBackend(set, get().itemsIds)

    return
  }

  await loadAuthenticatedCart(set, get, signal)
}

export async function clearCartStore(set: CartSet, get: CartGet): Promise<void> {
  const { tempItems, isSync } = get()
  const isAuthenticated = useAuthStore.getState().status === 'authenticated'

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

async function loadAuthenticatedCart(
  set: CartSet,
  get: CartGet,
  signal?: AbortSignal,
): Promise<void> {
  set({ status: 'loading', lastError: null })

  try {
    const cart = await fetchCart(signal)

    if (signal?.aborted) return

    if (cart.items.length === 0 && get().itemsIds.length > 0 && !get().isSync) {
      set({ lastError: null, status: 'ready' })

      return
    }

    setCartItems(set, cart.items, {
      count: cart.productsQuantity,
      isSync: cart.items.length > 0,
      lastError: null,
      status: 'ready',
      totalPrice: cart.itemsTotalPrice,
    })
  } catch (err) {
    if (isAbortError(err)) {
      return
    }

    setCartError(set, 'Failed to load cart', err)
  }
}

async function loadGuestCart(set: CartSet, get: CartGet): Promise<void> {
  set({ status: 'loading', lastError: null })

  try {
    const ids = get().itemsIds.map((item) => item.productId)

    if (ids.length === 0) {
      set({
        count: 0,
        itemsIds: [],
        lastError: null,
        status: 'ready',
        tempItems: [],
        totalPrice: 0,
      })

      return
    }

    const productList = await getProductByIds(ids)
    const cartItems: ICartItem[] = productList.map((item) => ({
      id: item.id,
      productInfo: { ...item },
      productQuantity: get().itemsIds.find(
        (cartItem) => cartItem.productId === item.id,
      )!.productQuantity,
    }))

    setCartItems(set, cartItems, { lastError: null, status: 'ready' })
  } catch (err) {
    setCartError(set, 'Failed to load cart', err)
  }
}

async function mergeGuestCartIntoBackend(
  set: CartSet,
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

async function updateBackendCartItem(
  set: CartSet,
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
