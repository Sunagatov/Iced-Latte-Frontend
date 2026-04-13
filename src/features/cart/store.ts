import { create, StateCreator } from 'zustand'
import { persist } from 'zustand/middleware'
import { ICartItem, ICartPushItem, ICartPushItems, ICartUpdatedItem } from './types'
import { useAuthStore } from '@/features/auth/store'
import {
  addToCart,
  removeItem,
  getProductsCount,
  getTotalPrice,

} from './cart.utils'
import {
  loadAuthCartIntoStore,
  loadGuestCartItemsIntoStore,
  syncBackendCartIntoStore,
  mergeCartsIntoStore,
  updateCartItemInStore,
  applyAuthenticatedAdd,
  applyAuthenticatedRemove,
  applyAuthenticatedRemoveFullProduct,
} from './cart.backend'
import { removeCartItem } from './api'
import { createItemsIdsFromCart } from './cart.utils'

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
  remove: (id: string) => void
  getCartItems: () => Promise<void>
  loadAuthCart: (signal?: AbortSignal) => Promise<void>
  syncBackendCart: () => Promise<void>
  removeFullProduct: (id: string) => void
  resetCart: () => void
  clearCart: () => Promise<void>
  setTempItems: (items: ICartItem[]) => void
  createCart: (reqItems: ICartPushItems) => Promise<void>
  updateCartItem: (updatedItem: ICartUpdatedItem) => Promise<void>
  retryHydration: () => void
}

export type CartSliceStore = CartSliceState & CartSliceActions

const initialState: CartSliceState = {
  itemsIds: [],
  tempItems: [],
  count: 0,
  totalPrice: 0,
  isSync: false,
  status: 'idle',
  pendingProductIds: new Set(),
  lastError: null,
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
    } else {
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
        itemsIds: updatedCart,
        tempItems: updatedTempItems,
        count: getProductsCount(updatedCart),
        totalPrice: getTotalPrice(updatedTempItems),
      })
      get().getCartItems().catch(() => {})
    }
  },

  remove: (id) => {
    const isLoggedIn = useAuthStore?.getState?.()?.isLoggedIn ?? false

    if (isLoggedIn) {
      applyAuthenticatedRemove(set, get, id)
    } else {
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
        itemsIds: updatedCart,
        tempItems: updatedTempItems,
        count: getProductsCount(updatedCart),
        totalPrice: getTotalPrice(updatedTempItems),
      })
    }
  },

  removeFullProduct: (id) => {
    const isLoggedIn = useAuthStore?.getState?.()?.isLoggedIn ?? false

    if (isLoggedIn) {
      applyAuthenticatedRemoveFullProduct(set, get, id)
    } else {
      const { itemsIds, tempItems } = get()
      const updatedCart = itemsIds.filter((item) => item.productId !== id)
      const removedTempItems = tempItems.filter((item) => item.productInfo.id !== id)

      set({
        itemsIds: updatedCart,
        tempItems: removedTempItems,
        count: getProductsCount(updatedCart),
        totalPrice: getTotalPrice(removedTempItems),
      } as CartSliceState)
    }
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
        itemsIds: [],
        tempItems: [],
        count: 0,
        totalPrice: 0,
        isSync: isLoggedIn,
        status: 'ready',
        lastError: null,
        pendingProductIds: new Set(),
      } as CartSliceState)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to clear cart'

      set({ status: 'error', lastError: message })
    }
  },

  setTempItems: (items) =>
    set({
      itemsIds: createItemsIdsFromCart(items),
      tempItems: items,
      isSync: true,
      count: items.reduce((sum, i) => sum + i.productQuantity, 0),
      totalPrice: items.reduce((sum, i) => sum + i.productInfo.price * i.productQuantity, 0),
    }),

  resetCart: () =>
    set({
      itemsIds: [],
      tempItems: [],
      count: 0,
      totalPrice: 0,
      isSync: false,
      status: 'idle',
      pendingProductIds: new Set(),
      lastError: null,
    } as CartSliceState),

  retryHydration: () => {
    set({ status: 'idle', lastError: null })
    const isAuthenticated = useAuthStore?.getState?.()?.status === 'authenticated'

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
      itemsIds: state.itemsIds,
      tempItems: state.tempItems,
      count: state.count,
      totalPrice: state.totalPrice,
      isSync: state.isSync,
    }),
  }),
)
