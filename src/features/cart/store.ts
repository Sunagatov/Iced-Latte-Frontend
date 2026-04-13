import { create, StateCreator } from 'zustand'

export const MAX_CART_ITEM_QUANTITY = 99
import { persist } from 'zustand/middleware'
import {
  ICartItem,
  ICartPushItem,
  ICartPushItems,
  ICartUpdatedItem,
} from './types'
import { getProductByIds } from '@/features/products/api'
import {
  mergeCarts,
  removeCartItem,
  changeCartItemQuantity,
  fetchCart,
} from './api'
import { useAuthStore } from '@/features/auth/store'

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

type SetFn = {
  (partial: Partial<CartSliceStore>): void
  (fn: (s: CartSliceStore) => Partial<CartSliceStore>): void
}

const createCartSlice: StateCreator<CartSliceStore, [], [], CartSliceStore> = (
  set: SetFn,
  get,
) => ({
  ...initialState,
  add: (id: string) => {
    const {
      itemsIds,
      tempItems,
      updateCartItem,
      createCart,
      pendingProductIds,
    } = get() as CartSliceStore
    const isLoggedIn = useAuthStore?.getState?.()?.isLoggedIn ?? false
    const cartItem = itemsIds.find((item) => item.productId === id)

    if (pendingProductIds.has(id)) return

    if (isLoggedIn) {
      if (cartItem) {
        if (cartItem.productQuantity >= MAX_CART_ITEM_QUANTITY) return
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

        set((state) => ({
          ...state,
          itemsIds: optimisticIds,
          tempItems: optimisticTemps,
          count: getProductsCount(optimisticIds),
          totalPrice: getTotalPrice(optimisticTemps),
        }))
        setPending(set, id)
        updateCartItem({
          shoppingCartItemId: productCartSlotId,
          productQuantityChange: 1,
        })
          .catch(() => {
            set((state) => ({
              ...state,
              itemsIds,
              tempItems,
              count: getProductsCount(itemsIds),
              totalPrice: getTotalPrice(tempItems),
            }))
          })
          .finally(() => clearPending(set, id))
      } else {
        setPending(set, id)
        createCart({ items: [{ productId: id, productQuantity: 1 }] })
          .then(
            () => {
            /* no-op */
            },
            () => {
            /* no-op */
            },
          )
          .finally(() => clearPending(set, id))
      }
    } else {
      if (cartItem && cartItem.productQuantity >= MAX_CART_ITEM_QUANTITY) return
      const updatedCart = addToCart(id, itemsIds)
      const count = getProductsCount(updatedCart)

      const updatedTempItems = cartItem
        ? tempItems.map((tempItem: ICartItem) =>
          tempItem.productInfo.id === id
            ? { ...tempItem, productQuantity: tempItem.productQuantity + 1 }
            : tempItem,
        )
        : tempItems

      set((state) => ({
        ...state,
        itemsIds: updatedCart,
        tempItems: updatedTempItems,
        count,
        totalPrice: getTotalPrice(updatedTempItems),
      }))
      get()
        .getCartItems()
        .catch(() => {})
    }
  },
  getCartItems: async () => {
    set({ status: 'loading', lastError: null })
    try {
      const { itemsIds } = get()
      const ids = itemsIds.map((item) => item.productId)
      const productList = await getProductByIds(ids)
      const cartItems: ICartItem[] = productList.map((item) => ({
        id: item.id,
        productInfo: { ...item },
        productQuantity: itemsIds.find((i) => i.productId === item.id)!
          .productQuantity,
      }))
      const reconciledIds = cartItems.map((i) => ({
        productId: i.productInfo.id,
        productQuantity: i.productQuantity,
      }))

      set((state) => ({
        ...state,
        tempItems: cartItems,
        itemsIds: reconciledIds,
        count: getProductsCount(reconciledIds),
        totalPrice: getTotalPrice(cartItems),
        status: 'ready',
        lastError: null,
      }))
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load cart'

      set({ status: 'error', lastError: message })
    }
  },

  syncBackendCart: async () => {
    const { createCart, itemsIds } = get()

    await createCart({ items: itemsIds })
  },
  loadAuthCart: async (signal?: AbortSignal) => {
    set({ status: 'loading', lastError: null })
    try {
      const cart = await fetchCart(signal)

      set((state) => ({
        ...state,
        itemsIds: createItemsIdsFromCart(cart.items),
        tempItems: cart.items,
        count: cart.productsQuantity,
        totalPrice: cart.itemsTotalPrice,
        isSync: true,
        status: 'ready',
        lastError: null,
      }))
    } catch (err) {
      if ((err as { name?: string }).name === 'AbortError' || (err as { name?: string }).name === 'CanceledError') {
        return
      }

      const message = err instanceof Error ? err.message : 'Failed to load cart'

      set({ status: 'error', lastError: message })
    }
  },
  remove: (id: string) => {
    const {
      tempItems,
      itemsIds,
      updateCartItem,
      removeFullProduct,
      pendingProductIds,
    } = get()
    const isLoggedIn = useAuthStore?.getState?.()?.isLoggedIn ?? false

    if (pendingProductIds.has(id)) return

    if (isLoggedIn) {
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

      set((state) => ({
        ...state,
        itemsIds: optimisticIds,
        tempItems: optimisticTemps,
        count: getProductsCount(optimisticIds),
        totalPrice: getTotalPrice(optimisticTemps),
      }))
      setPending(set, id)
      updateCartItem({
        shoppingCartItemId: productCartSlotId,
        productQuantityChange: -1,
      })
        .catch(() => {
          set((state) => ({
            ...state,
            itemsIds,
            tempItems,
            count: getProductsCount(itemsIds),
            totalPrice: getTotalPrice(tempItems),
          }))
        })
        .finally(() => clearPending(set, id))
    } else {
      const updatedCart = removeItem(id, itemsIds)
      const updatedTempItems = tempItems
        .map((tempItem) =>
          tempItem.productInfo.id === id
            ? { ...tempItem, productQuantity: tempItem.productQuantity - 1 }
            : tempItem,
        )
        .filter((tempItem) => tempItem.productQuantity > 0)

      set((state) => ({
        ...state,
        itemsIds: updatedCart,
        tempItems: updatedTempItems,
        count: getProductsCount(updatedCart),
        totalPrice: getTotalPrice(updatedTempItems),
      }))
    }
  },
  removeFullProduct: (id: string) => {
    const isLoggedIn = useAuthStore?.getState?.()?.isLoggedIn ?? false

    if (isLoggedIn) {
      const { tempItems, pendingProductIds } = get()

      if (pendingProductIds.has(id)) return
      const productCartSlotId = getProductCartSlotId(id, tempItems)

      if (!productCartSlotId) return
      setPending(set, id)
      removeCartItem([productCartSlotId])
        .then((data) => {
          const { itemsTotalPrice, productsQuantity, items } = data

          set((state) => ({
            ...state,
            itemsIds: createItemsIdsFromCart(items),
            tempItems: items,
            count: productsQuantity,
            totalPrice: itemsTotalPrice,
          }))
        })
        .catch((err) => {
          const message =
            err instanceof Error ? err.message : 'Failed to remove item'

          set({ status: 'error', lastError: message })
        })
        .finally(() => clearPending(set, id))
    } else {
      const { itemsIds, tempItems } = get()
      const updatedCart = itemsIds.filter((item) => item.productId !== id)
      const removedTempItems = tempItems.filter(
        (item) => item.productInfo.id !== id,
      )

      set({
        itemsIds: updatedCart,
        tempItems: removedTempItems,
        count: getProductsCount(updatedCart),
        totalPrice: getTotalPrice(removedTempItems),
      } as CartSliceState)
    }
  },
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
      const message =
        err instanceof Error ? err.message : 'Failed to clear cart'

      set({ status: 'error', lastError: message })
    }
  },
  setTempItems: (items) =>
    set((state) => ({
      ...state,
      itemsIds: items.map((i) => ({
        productId: i.productInfo.id,
        productQuantity: i.productQuantity,
      })),
      tempItems: items,
      isSync: true,
      count: items.reduce((sum, i) => sum + i.productQuantity, 0),
      totalPrice: items.reduce(
        (sum, i) => sum + i.productInfo.price * i.productQuantity,
        0,
      ),
    })),
  createCart: async (reqItems: ICartPushItems): Promise<void> => {
    set({ status: 'syncing' })
    try {
      const mergedCart = await mergeCarts(reqItems)
      const { itemsTotalPrice, productsQuantity, items } = mergedCart

      set((state) => ({
        ...state,
        itemsIds: createItemsIdsFromCart(items),
        tempItems: items,
        count: productsQuantity,
        totalPrice: itemsTotalPrice,
        isSync: true,
        status: 'ready',
      }))
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Failed to update cart'

      set({ status: 'error', lastError: message })
      throw err
    }
  },
  updateCartItem: async (updatedItem: ICartUpdatedItem): Promise<void> => {
    set({ status: 'syncing' })
    try {
      const data = await changeCartItemQuantity(updatedItem)
      const { itemsTotalPrice, productsQuantity, items } = data
      const filteredItems = items.filter((item) => item.productQuantity > 0)

      set((state) => ({
        ...state,
        itemsIds: createItemsIdsFromCart(filteredItems),
        tempItems: filteredItems,
        count: productsQuantity,
        totalPrice: itemsTotalPrice,
        status: 'ready',
      }))
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Failed to update cart'

      set({ status: 'error', lastError: message })
      throw err
    }
  },
  retryHydration: () => {
    set({ status: 'idle', lastError: null })
    const isAuthenticated =
      useAuthStore?.getState?.()?.status === 'authenticated'

    if (isAuthenticated) {
      get()
        .loadAuthCart()
        .catch(() => {})
    } else {
      get()
        .getCartItems()
        .catch(() => {})
    }
  },
})

function addToCart(id: string, cartList: ICartPushItem[]): ICartPushItem[] {
  const cartItem = cartList.find((item) => item.productId === id)

  if (!cartItem) return [...cartList, { productId: id, productQuantity: 1 }]

  return cartList.map((item) =>
    item.productId === id
      ? { ...item, productQuantity: item.productQuantity + 1 }
      : item,
  )
}

function removeItem(id: string, cartList: ICartPushItem[]): ICartPushItem[] {
  return cartList
    .map((item) =>
      item.productId === id
        ? { ...item, productQuantity: item.productQuantity - 1 }
        : item,
    )
    .filter((item) => item.productQuantity)
}

function getProductsCount(cartList: ICartPushItem[]): number {
  return cartList.length
    ? cartList.reduce((prev, curr) => prev + curr.productQuantity, 0)
    : 0
}

function getTotalPrice(cartList: ICartItem[]): number {
  return cartList.length
    ? cartList.reduce(
      (prev, curr) => prev + curr.productInfo.price * curr.productQuantity,
      0,
    )
    : 0
}

function getProductCartSlotId(
  id: string,
  cartList: ICartItem[],
): string | undefined {
  return cartList.find((item) => item.productInfo.id === id)?.id
}

function createItemsIdsFromCart(cartItems: ICartItem[]): ICartPushItem[] {
  return cartItems.map((item) => ({
    productId: item.productInfo.id,
    productQuantity: item.productQuantity,
  }))
}

function setPending(set: SetFn, id: string) {
  set((state) => {
    const next = new Set(state.pendingProductIds)

    next.add(id)

    return { pendingProductIds: next }
  })
}

function clearPending(set: SetFn, id: string) {
  set((state) => {
    const next = new Set(state.pendingProductIds)

    next.delete(id)

    return { pendingProductIds: next }
  })
}

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
