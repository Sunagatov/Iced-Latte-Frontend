import type { AuthStatus } from '@/features/auth/public'
import { useAuthStore } from '@/features/auth/store'
import { isSyncRejected } from '@/features/session/syncCommands'
import { fetchCart } from '@/features/cart/cartApi'
import {
  clearCartStore as clearCartStoreState,
  mergeGuestCartIntoBackend,
} from '@/features/cart/cart.mutations'
import type { ICartItem } from '@/features/cart/cartTypes'
import {
  getProductsCount,
  normalizeCartItems,
} from '@/features/cart/utils/cartUtils'
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
  authStatus: AuthStatus,
  signal?: AbortSignal,
): Promise<void> {
  if (signal?.aborted || authStatus === 'loading') return
  if (authStatus === 'authenticated') {
    await loadAuthenticatedCart(set, get, signal)

    return
  }

  await loadGuestCart(set, get)
}

export async function syncCartStoreWithSession(
  set: StoreSet,
  get: StoreGet,
  authStatus: AuthStatus,
  signal?: AbortSignal,
): Promise<void> {
  if (signal?.aborted || authStatus === 'loading') return
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

  if (get().pendingMerge || (!get().isSync && get().itemsIds.length > 0)) {
    const pending = get().pendingMerge
    const accountEmail = useAuthStore.getState().userData?.email ?? null

    if (pending && pending.accountEmail !== accountEmail) {
      set({ pendingMerge: null, isSync: true })
      await get().hydrate(signal, authStatus)

      return
    }
    const names = {
      ...get().guestConflict?.names,
      ...Object.fromEntries(
        get().tempItems.map((item) => [
          item.productInfo.id,
          item.productInfo.name,
        ]),
      ),
    }
    const guestItems = normalizeCartItems(pending?.items ?? get().itemsIds)

    if (guestItems.length > 0) {
      const merge = pending ?? {
        key: crypto.randomUUID(),
        items: guestItems,
        accountEmail,
      }

      set({ pendingMerge: merge })
      try {
        await mergeGuestCartIntoBackend(set, guestItems, signal, merge.key)
      } catch (error) {
        if (!isSyncRejected(error)) throw error
        set({
          pendingMerge: null,
          guestConflict: {
            items: guestItems,
            message: error.message,
            names,
            accountEmail,
          },
          isSync: true,
        })
        await get().hydrate(signal, authStatus)
      }

      return
    }

    set({ pendingMerge: null, isSync: true, itemsIds: [] })
    await get().hydrate(signal, authStatus)

    return
  }

  await get().hydrate(signal, authStatus)
}

export async function clearCartStoreForSession(
  set: StoreSet,
  get: StoreGet,
  authStatus: AuthStatus,
  productIds?: Set<string>,
): Promise<void> {
  await clearCartStoreState(
    set,
    get,
    authStatus === 'authenticated',
    productIds,
  )
}

async function loadAuthenticatedCart(
  set: StoreSet,
  get: StoreGet,
  signal?: AbortSignal,
): Promise<void> {
  set({ status: 'loading', lastError: null })

  try {
    await fetchCart(signal)
    if (signal?.aborted) return
    set({ isSync: true, lastError: null, status: 'ready' })
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
    const loadedIds = new Set(productList.map((item) => item.id))
    const requestedIds = new Set(ids)
    const currentItems = normalizeCartItems(get().itemsIds).filter(
      (item) =>
        !requestedIds.has(item.productId) || loadedIds.has(item.productId),
    )
    const quantityByProductId = new Map(
      currentItems.map((item) => [item.productId, item.productQuantity]),
    )
    // Another load may already have supplied products added during this request.
    const productsById = new Map(
      get().tempItems.map((item) => [item.productInfo.id, item.productInfo]),
    )

    productList.forEach((item) => productsById.set(item.id, item))
    const cartItems: ICartItem[] = Array.from(productsById.values()).flatMap(
      (item) => {
        const productQuantity = quantityByProductId.get(item.id)

        if (!productQuantity) {
          return []
        }

        return [
          {
            id: item.id,
            productInfo: { ...item },
            productQuantity,
          },
        ]
      },
    )

    setCartItems(set, cartItems, {
      itemsIds: currentItems,
      count: getProductsCount(currentItems),
      lastError: null,
      status: 'ready',
    })
  } catch (err) {
    setCartError(set, 'Failed to load cart', err)
  }
}
