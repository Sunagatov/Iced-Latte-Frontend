import { useAuthStore } from '@/features/auth/store'
import { fetchCart } from '@/features/cart/cartApi'
import {
  clearCartStore as clearCartStoreState,
  mergeGuestCartIntoBackend,
} from '@/features/cart/cart.mutations'
import type { ICartItem } from '@/features/cart/cartTypes'
import { normalizeCartItems } from '@/features/cart/utils/cartUtils'
import {
  setCartError,
  setCartItems,
  type StoreGet,
  type StoreSet,
} from '@/features/cart/utils/cartStoreHelpers'
import { getProductByIds } from '@/features/products/api'

function isAbortError(err: unknown): boolean {
  return (
    (err as { name?: string }).name === 'AbortError' ||
    (err as { name?: string }).name === 'CanceledError'
  )
}

export async function hydrateCartStore(
  set: StoreSet,
  get: StoreGet,
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
  set: StoreSet,
  get: StoreGet,
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
    await mergeGuestCartIntoBackend(set, normalizeCartItems(get().itemsIds))

    return
  }

  await loadAuthenticatedCart(set, get, signal)
}

export async function clearCartStore(set: StoreSet, get: StoreGet): Promise<void> {
  const isAuthenticated = useAuthStore.getState().status === 'authenticated'

  await clearCartStoreState(set, get, isAuthenticated)
}

async function loadAuthenticatedCart(
  set: StoreSet,
  get: StoreGet,
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

async function loadGuestCart(set: StoreSet, get: StoreGet): Promise<void> {
  set({ status: 'loading', lastError: null })

  try {
    const itemsIds = normalizeCartItems(get().itemsIds)
    const ids = itemsIds.map((item) => item.productId)

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
      productQuantity: itemsIds.find(
        (cartItem) => cartItem.productId === item.id,
      )!.productQuantity,
    }))

    setCartItems(set, cartItems, { lastError: null, status: 'ready' })
  } catch (err) {
    setCartError(set, 'Failed to load cart', err)
  }
}
