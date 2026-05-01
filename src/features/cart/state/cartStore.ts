import { create, type StateCreator } from 'zustand'
import { persist } from 'zustand/middleware'
import { useAuthStore } from '@/features/auth/store'
import { removeCartItem } from '@/features/cart/api/cartApi'
import type {
  ICartItem,
  ICartPushItem,
  ICartPushItems,
  ICartUpdatedItem,
} from '@/features/cart/types/cartTypes'
import {
  applyAuthenticatedAdd,
  applyAuthenticatedRemove,
  applyAuthenticatedRemoveFullProduct,
  loadAuthCartIntoStore,
  loadGuestCartItemsIntoStore,
  mergeCartsIntoStore,
  syncBackendCartIntoStore,
  updateCartItemInStore,
} from '@/features/cart/utils/cartBackend'
import {
  addToCart,
  createItemsIdsFromCart,
  getProductsCount,
  getTotalPrice,
  removeItem,
} from '@/features/cart/utils/cartUtils'

export const MAX_CART_ITEM_QUANTITY = 99

export type CartStatus = 'idle' | 'loading' | 'syncing' | 'ready' | 'error'

interface CartSliceState {
  itemsIds: ICartPushItem[]
  tempItems: ICartItem[]
  count: number
  totalPrice: number
  isSync: boolean
  status: CartStatus
  pendingProductIds: Set<string>
  lastError: string | null
}

interface CartSliceActions {
  add: (id: string) => void
  clearCart: () => Promise<void>
  createCart: (reqItems: ICartPushItems) => Promise<void>
  getCartItems: () => Promise<void>
  loadAuthCart: (signal?: AbortSignal) => Promise<void>
  remove: (id: string) => void
  removeFullProduct: (id: string) => void
  resetCart: () => void
  retryHydration: () => void
  setTempItems: (items: ICartItem[]) => void
  syncBackendCart: () => Promise<void>
  updateCartItem: (updatedItem: ICartUpdatedItem) => Promise<void>
}

export type CartSliceStore = CartSliceState & CartSliceActions

const initialState: CartSliceState = {
  count: 0,
  isSync: false,
  itemsIds: [],
  lastError: null,
  pendingProductIds: new Set(),
  status: 'idle',
  tempItems: [],
  totalPrice: 0,
}

const createCartSlice: StateCreator<CartSliceStore, [], [], CartSliceStore> = (
  set,
  get,
) => ({
  ...initialState,

  add: (id) => {
    const isLoggedIn = useAuthStore?.getState?.()?.isLoggedIn ?? false
    const { itemsIds, tempItems, pendingProductIds } = get()
    const cartItem = itemsIds.find((item) => item.productId === id)

    if (isLoggedIn) {
      if (cartItem && cartItem.productQuantity >= MAX_CART_ITEM_QUANTITY) return
      applyAuthenticatedAdd(set, get, id)

      return
    }

    if (cartItem && cartItem.productQuantity >= MAX_CART_ITEM_QUANTITY) return
    if (pendingProductIds.has(id)) return

    const updatedCart = addToCart(id, itemsIds)
    const updatedTempItems = cartItem
      ? tempItems.map((tempItem) =>
        tempItem.productInfo.id === id
          ? { ...tempItem, productQuantity: tempItem.productQuantity + 1 }
          : tempItem,
      )
      : tempItems

    set({
      count: getProductsCount(updatedCart),
      itemsIds: updatedCart,
      tempItems: updatedTempItems,
      totalPrice: cartItem ? getTotalPrice(updatedTempItems) : get().totalPrice,
    })
    get().getCartItems().catch(() => {})
  },

  remove: (id) => {
    const isLoggedIn = useAuthStore?.getState?.()?.isLoggedIn ?? false

    if (isLoggedIn) {
      applyAuthenticatedRemove(set, get, id)

      return
    }

    const { itemsIds, tempItems } = get()
    const updatedCart = removeItem(id, itemsIds)
    const updatedTempItems = tempItems
      .map((tempItem) =>
        tempItem.productInfo.id === id
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
  },

  removeFullProduct: (id) => {
    const isLoggedIn = useAuthStore?.getState?.()?.isLoggedIn ?? false

    if (isLoggedIn) {
      applyAuthenticatedRemoveFullProduct(set, get, id)

      return
    }

    const { itemsIds, tempItems } = get()
    const updatedCart = itemsIds.filter((item) => item.productId !== id)
    const removedTempItems = tempItems.filter(
      (item) => item.productInfo.id !== id,
    )

    set({
      count: getProductsCount(updatedCart),
      itemsIds: updatedCart,
      tempItems: removedTempItems,
      totalPrice: getTotalPrice(removedTempItems),
    } as CartSliceState)
  },

  getCartItems: () => loadGuestCartItemsIntoStore(set, get),
  loadAuthCart: (signal) => loadAuthCartIntoStore(set, get, signal),
  syncBackendCart: () => syncBackendCartIntoStore(get),
  createCart: (reqItems) => mergeCartsIntoStore(set, reqItems),
  updateCartItem: (updatedItem) => updateCartItemInStore(set, updatedItem),

  clearCart: async () => {
    const { tempItems, isSync } = get()
    const isLoggedIn = useAuthStore?.getState?.()?.isLoggedIn ?? false

    set({ status: 'syncing' })

    try {
      if (isLoggedIn && isSync && tempItems.length > 0) {
        const ids = tempItems.map((item) => item.id)

        await removeCartItem(ids)
      }

      set({
        count: 0,
        isSync: isLoggedIn,
        itemsIds: [],
        lastError: null,
        pendingProductIds: new Set(),
        status: 'ready',
        tempItems: [],
        totalPrice: 0,
      } as CartSliceState)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to clear cart'

      set({ lastError: message, status: 'error' })
    }
  },

  setTempItems: (items) =>
    set({
      count: items.reduce((sum, item) => sum + item.productQuantity, 0),
      isSync: true,
      itemsIds: createItemsIdsFromCart(items),
      tempItems: items,
      totalPrice: items.reduce(
        (sum, item) => sum + item.productInfo.price * item.productQuantity,
        0,
      ),
    }),

  resetCart: () =>
    set({
      count: 0,
      isSync: false,
      itemsIds: [],
      lastError: null,
      pendingProductIds: new Set(),
      status: 'idle',
      tempItems: [],
      totalPrice: 0,
    } as CartSliceState),

  retryHydration: () => {
    set({ lastError: null, status: 'idle' })
    const isAuthenticated =
      useAuthStore?.getState?.()?.status === 'authenticated'

    if (isAuthenticated) {
      get().loadAuthCart().catch(() => {})
    } else {
      get().getCartItems().catch(() => {})
    }
  },
})

export const useCartStore = create<CartSliceStore>()(
  persist(createCartSlice, {
    name: 'cart-storage',
    partialize: (state) => ({
      count: state.count,
      isSync: state.isSync,
      itemsIds: state.itemsIds,
      tempItems: state.tempItems,
      totalPrice: state.totalPrice,
    }),
  }),
)
