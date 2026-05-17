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
} from '@/features/cart/cart.mutations'
import type { ICartItem } from '@/features/cart/cartTypes'
import {
  clearCartStore,
  hydrateCartStore,
  syncCartStoreWithSession,
} from '@/features/cart/cart.sync'
import {
  MAX_CART_ITEM_QUANTITY,
} from '@/features/cart/utils/cartUtils'
import {
  getCartSnapshot,
  type CartStoreState,
  type StoreGet,
  type StoreSet,
} from '@/features/cart/utils/cartStoreHelpers'

export { MAX_CART_ITEM_QUANTITY }
export type { CartStatus } from '@/features/cart/utils/cartStoreHelpers'

type CartSliceState = CartStoreState

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
      applyAuthenticatedAdd(set as StoreSet, get as StoreGet, id)

      return
    }

    applyGuestAdd(set as StoreSet, get as StoreGet, id)
  },

  remove: (id) => {
    const isLoggedIn = useAuthStore?.getState?.()?.isLoggedIn ?? false

    if (isLoggedIn) {
      applyAuthenticatedRemove(set as StoreSet, get as StoreGet, id)

      return
    }

    applyGuestRemove(set as StoreSet, get as StoreGet, id)
  },

  removeFullProduct: (id) => {
    const isLoggedIn = useAuthStore?.getState?.()?.isLoggedIn ?? false

    if (isLoggedIn) {
      applyAuthenticatedRemoveFullProduct(set as StoreSet, get as StoreGet, id)

      return
    }

    applyGuestRemoveFullProduct(set as StoreSet, get as StoreGet, id)
  },

  hydrate: (signal) => hydrateCartStore(set as StoreSet, get as StoreGet, signal),
  syncSession: (signal) =>
    syncCartStoreWithSession(set as StoreSet, get as StoreGet, signal),
  clearCart: () => clearCartStore(set as StoreSet, get as StoreGet),

  setTempItems: (items) =>
    set({
      ...getCartSnapshot(items),
      isSync: true,
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
