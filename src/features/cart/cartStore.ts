import { create, type StateCreator } from 'zustand'
import { persist } from 'zustand/middleware'
import {
  getClientAuthStatus,
  type AuthStatus,
} from '@/shared/auth/sessionStatus'
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
  clearCartStoreForSession,
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
type CartSliceState = CartStoreState

interface CartSliceActions {
  add: (id: string) => void
  clearCart: () => Promise<void>
  hydrate: (signal?: AbortSignal, authStatus?: AuthStatus) => Promise<void>
  remove: (id: string) => void
  removeFullProduct: (id: string) => void
  resetCart: () => void
  retryHydration: () => void
  setTempItems: (items: ICartItem[]) => void
  syncSession: (signal?: AbortSignal, authStatus?: AuthStatus) => Promise<void>
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
    const isLoggedIn = getClientAuthStatus() === 'authenticated'

    if (isLoggedIn) {
      applyAuthenticatedAdd(set as StoreSet, get as StoreGet, id)

      return
    }

    applyGuestAdd(set as StoreSet, get as StoreGet, id)
  },

  remove: (id) => {
    const isLoggedIn = getClientAuthStatus() === 'authenticated'

    if (isLoggedIn) {
      applyAuthenticatedRemove(set as StoreSet, get as StoreGet, id)

      return
    }

    applyGuestRemove(set as StoreSet, get as StoreGet, id)
  },

  removeFullProduct: (id) => {
    const isLoggedIn = getClientAuthStatus() === 'authenticated'

    if (isLoggedIn) {
      applyAuthenticatedRemoveFullProduct(set as StoreSet, get as StoreGet, id)

      return
    }

    applyGuestRemoveFullProduct(set as StoreSet, get as StoreGet, id)
  },

  hydrate: (signal, authStatus = getClientAuthStatus()) =>
    hydrateCartStore(set as StoreSet, get as StoreGet, authStatus, signal),
  syncSession: (signal, authStatus = getClientAuthStatus()) =>
    syncCartStoreWithSession(
      set as StoreSet,
      get as StoreGet,
      authStatus,
      signal,
    ),
  clearCart: () =>
    clearCartStoreForSession(
      set as StoreSet,
      get as StoreGet,
      getClientAuthStatus(),
    ),

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
