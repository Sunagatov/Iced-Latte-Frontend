import { create, type StateCreator } from 'zustand'
import { persist } from 'zustand/middleware'
import { accountIdentity, useAuthStore } from '@/features/auth/store'
import { captureAccountScope } from '@/features/auth/accountScope'
import { createCollectionSync } from '@/features/session/collectionSync'
import { onSnapshot } from '@/features/session/resourceState'
import type { ICart } from '@/features/cart/cartTypes'
import { pendingCommands } from '@/features/session/syncCommands'
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
import { MAX_CART_ITEM_QUANTITY } from '@/features/cart/utils/cartUtils'
import {
  getCartSnapshot,
  type CartStoreState,
  type StoreGet,
  type StoreSet,
} from '@/features/cart/utils/cartStoreHelpers'

export { MAX_CART_ITEM_QUANTITY }
type CartSliceState = CartStoreState

interface CartSliceActions {
  editGuestDraft: (items: import('./cartTypes').ICartPushItem[]) => void
  retryGuestDraft: () => Promise<void>
  add: (id: string) => void
  clearCart: () => Promise<void>
  hydrate: (signal?: AbortSignal, authStatus?: AuthStatus) => Promise<void>
  remove: (id: string) => void
  removeFullProduct: (id: string) => void
  resetCart: (preserveGuest?: boolean) => void
  retryHydration: () => void
  setTempItems: (items: ICartItem[]) => void
  syncSession: (signal?: AbortSignal, authStatus?: AuthStatus) => Promise<void>
}

export type CartSliceStore = CartSliceState & CartSliceActions

const initialState: CartSliceState = {
  guestConflict: null,
  pendingMerge: null,
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
) => {
  const sync = createCollectionSync()

  function mutationSet(signal?: AbortSignal): StoreSet {
    const apply = sync.mutation(signal)

    return partial => apply(() => set(partial))
  }

  function loadSet(signal?: AbortSignal): StoreSet {
    const request = sync.read(signal)

    return (partial) => {
      if (!request.isCurrent()) return
      set(partial)
    }
  }

  function write(action: () => void | Promise<void>): void | Promise<void> {
    const account = captureAccountScope()
    const status = getClientAuthStatus()

    if (status === 'loading') return
    if (status === 'authenticated' && (!get().isSync || get().pendingMerge)) {
      return get()
        .syncSession()
        .then(() => {
          if (
            account.isCurrent() &&
            get().isSync &&
            !get().pendingMerge &&
            !get().guestConflict
          )
            return sync.trackWrite(action)
        })
        .catch(() => {})
    }

    return sync.trackWrite(action)
  }

  return {
    ...initialState,
    editGuestDraft: (items) =>
      set((state) => ({
        guestConflict:
          items.length && state.guestConflict
            ? { ...state.guestConflict, items }
            : null,
      })),
    retryGuestDraft: async () => {
      const draft = get().guestConflict

      if (!draft) return
      set({
        pendingMerge: {
          key: crypto.randomUUID(),
          items: draft.items,
          accountEmail: useAuthStore.getState().userData?.email ?? null,
        },
      })
      await get().syncSession()
    },

    add: (id) => {
      void write(() => {
        const isLoggedIn = getClientAuthStatus() === 'authenticated'

        if (isLoggedIn) {
          return applyAuthenticatedAdd(
            mutationSet(),
            get as StoreGet,
            id,
          )
        }

        applyGuestAdd(mutationSet(), get as StoreGet, id)
      })
    },

    remove: (id) => {
      void write(() => {
        const isLoggedIn = getClientAuthStatus() === 'authenticated'

        if (isLoggedIn) {
          return applyAuthenticatedRemove(
            mutationSet(),
            get as StoreGet,
            id,
          )
        }

        applyGuestRemove(mutationSet(), get as StoreGet, id)
      })
    },

    removeFullProduct: (id) => {
      void write(() => {
        const isLoggedIn = getClientAuthStatus() === 'authenticated'

        if (isLoggedIn) {
          return applyAuthenticatedRemoveFullProduct(
            mutationSet(),
            get as StoreGet,
            id,
          )
        }

        applyGuestRemoveFullProduct(
          mutationSet(),
          get as StoreGet,
          id,
        )
      })
    },

    hydrate: (signal, authStatus = getClientAuthStatus()) => {
      if (
        authStatus === 'authenticated' &&
        (get().pendingMerge || (!get().isSync && get().itemsIds.length > 0))
      )
        return get().syncSession(signal, authStatus)

      return hydrateCartStore(
        loadSet(signal),
        get as StoreGet,
        authStatus,
        signal,
      )
    },
    syncSession: (signal, authStatus = getClientAuthStatus()) =>
      sync.run(signal, () =>
        syncCartStoreWithSession(
          loadSet(signal),
          get as StoreGet,
          authStatus,
          signal,
        ),
      ),
    clearCart: async () => {
      const account = captureAccountScope()
      const productIds = new Set([
        ...get().itemsIds.map((item) => item.productId),
        ...get().pendingProductIds,
        ...pendingCommands('cart').flatMap((command) => {
          const items = command.payload.items

          return Array.isArray(items)
            ? items.flatMap((item) =>
              typeof item?.productId === 'string' ? [item.productId] : [],
            )
            : []
        }),
      ])

      await sync.pendingWrites()
      if (!account.isCurrent()) return
      await write(() =>
        clearCartStoreForSession(
          mutationSet(),
          get as StoreGet,
          getClientAuthStatus(),
          productIds,
        ),
      )
    },

    setTempItems: (items) => {
      set({
        ...getCartSnapshot(items),
        isSync: true,
      })
    },

    resetCart: (preserveGuest = false) => {
      sync.reset()
      const current = get()
      const ownsMerge =
        !current.pendingMerge ||
        current.pendingMerge.accountEmail ===
          (useAuthStore.getState().userData?.email ?? null)
      const guest =
        preserveGuest && ownsMerge && (!current.isSync || current.pendingMerge)
          ? current
          : initialState

      set({
        count: guest.count,
        guestConflict:
          preserveGuest &&
          current.guestConflict?.accountEmail ===
            useAuthStore.getState().userData?.email
            ? current.guestConflict
            : null,
        pendingMerge: guest.pendingMerge,
        isSync: false,
        itemsIds: guest.itemsIds,
        lastError: null,
        pendingProductIds: new Set(),
        status: 'idle',
        tempItems: guest.tempItems,
        totalPrice: guest.totalPrice,
      })
    },

    retryHydration: () => {
      set({ lastError: null, status: 'idle' })
      void get()
        .syncSession()
        .catch(() => {})
    },
  }
}

export const useCartStore = create<CartSliceStore>()(
  persist(createCartSlice, {
    name: 'cart-storage',
    partialize: (state) => ({
      count: state.count,
      guestConflict: state.guestConflict,
      pendingMerge: state.pendingMerge,
      isSync: state.isSync,
      itemsIds: state.itemsIds,
      tempItems: state.tempItems,
      totalPrice: state.totalPrice,
    }),
  }),
)

onSnapshot('cart', (snapshot) => {
  const auth = useAuthStore.getState()

  if (
    auth.status !== 'authenticated' ||
    accountIdentity(auth.userData) !== snapshot.userId
  )
    return
  const cart = snapshot.data as unknown as ICart
  const current = useCartStore.getState()

  useCartStore.setState({
    ...getCartSnapshot(cart.items),
    isSync: true,
    lastError: null,
    status:
      current.pendingProductIds.size || current.pendingMerge
        ? 'syncing'
        : 'ready',
  })
})
