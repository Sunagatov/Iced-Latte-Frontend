import { create, type StateCreator } from 'zustand'
import { persist } from 'zustand/middleware'
import { useAuthStore } from '@/features/auth/store'
import {
  applyAuthenticatedAdd,
  applyAuthenticatedRemove,
  applyAuthenticatedRemoveFullProduct,
  applyGuestAdd,
  applyGuestRemove,
  applyGuestRemoveFullProduct,
  clearCartStore,
  hydrateCartStore,
  syncCartStoreWithSession,
} from '@/features/cart/cart.service'
import type { CartStatus } from '@/features/cart/cart.service.types'
import type {
  ICartItem,
  ICartPushItem,
} from '@/features/cart/types/cartTypes'
import {
  createItemsIdsFromCart,
} from '@/features/cart/utils/cartUtils'

export const MAX_CART_ITEM_QUANTITY = 99
export type { CartStatus } from '@/features/cart/cart.service.types'

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
  hydrate: (signal?: AbortSignal) => Promise<void>
  remove: (id: string) => void
  removeFullProduct: (id: string) => void
  resetCart: () => void
  retryHydration: () => void
  setTempItems: (items: ICartItem[]) => void
  syncSession: (signal?: AbortSignal) => Promise<void>
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

    if (isLoggedIn) {
      applyAuthenticatedAdd(set, get, id)

      return
    }

    applyGuestAdd(set, get, id)
  },

  remove: (id) => {
    const isLoggedIn = useAuthStore?.getState?.()?.isLoggedIn ?? false

    if (isLoggedIn) {
      applyAuthenticatedRemove(set, get, id)

      return
    }

    applyGuestRemove(set, get, id)
  },

  removeFullProduct: (id) => {
    const isLoggedIn = useAuthStore?.getState?.()?.isLoggedIn ?? false

    if (isLoggedIn) {
      applyAuthenticatedRemoveFullProduct(set, get, id)

      return
    }

    applyGuestRemoveFullProduct(set, get, id)
  },

  hydrate: (signal) => hydrateCartStore(set, get, signal),
  syncSession: (signal) => syncCartStoreWithSession(set, get, signal),
  clearCart: () => clearCartStore(set, get),

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
    void get().hydrate().catch(() => {})
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
