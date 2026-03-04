import { create, StateCreator } from 'zustand'
import { persist } from 'zustand/middleware'
import { ICartItem, ICartPushItem, ICartPushItems, ICartUpdatedItem } from './types'
import { getProductByIds } from '@/features/products/api'
import { mergeCarts, removeCartItem, changeCartItemQuantity } from './api'
import { useAuthStore } from '@/features/auth/store'

interface CartSliceState {
  itemsIds: ICartPushItem[]
  tempItems: ICartItem[]
  count: number
  totalPrice: number
  isSync: boolean
}

interface CartSliceActions {
  add: (id: string) => void
  remove: (id: string) => void
  getCartItems: () => Promise<void>
  syncBackendCart: (token: string) => Promise<void>
  removeFullProduct: (id: string) => void
  resetCart: () => void
  setTempItems: (items: ICartItem[]) => void
  createCart: (reqItems: ICartPushItems) => Promise<void>
  updateCartItem: (updatedItem: ICartUpdatedItem) => Promise<void>
}

export type CartSliceStore = CartSliceState & CartSliceActions

const initialState: CartSliceState = {
  itemsIds: [],
  tempItems: [],
  count: 0,
  totalPrice: 0,
  isSync: false,
}

const createCartSlice: StateCreator<CartSliceStore, [], [], CartSliceStore> = (set, get) => ({
  ...initialState,
  add: (id: string) => {
    const { itemsIds, tempItems, updateCartItem, createCart } = get()
    const token = useAuthStore?.getState?.()?.token ?? null
    const cartItem = itemsIds.find((item) => item.productId === id)

    if (token) {
      if (cartItem) {
        const productCartSlotId = getProductCartSlotId(id, tempItems)

        if (!productCartSlotId) return
        updateCartItem({ shoppingCartItemId: productCartSlotId, productQuantityChange: 1 }).catch(() => {})
      } else {
        createCart({ items: [{ productId: id, productQuantity: 1 }] }).catch(() => {})
      }
    } else {
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
    }
  },
  getCartItems: async () => {
    const { itemsIds } = get()
    const ids = itemsIds.map((item) => item.productId)
    const productList = await getProductByIds(ids)
    const cartItems: ICartItem[] = productList.map((item) => ({
      id: item.id,
      productInfo: { ...item },
      productQuantity: itemsIds.find((i) => i.productId === item.id)!.productQuantity,
    }))

    set((state) => ({ ...state, tempItems: cartItems, totalPrice: getTotalPrice(cartItems) }))
  },
  syncBackendCart: async (token: string) => {
    const { createCart, itemsIds } = get()
    void token
    await createCart({ items: itemsIds })
  },
  remove: (id: string) => {
    const { tempItems, itemsIds, updateCartItem, removeFullProduct } = get()
    const token = useAuthStore?.getState?.()?.token ?? null

    if (token) {
      const productCartSlotId = getProductCartSlotId(id, tempItems)

      if (!productCartSlotId) return
      const currentItem = tempItems.find((item) => item.productInfo.id === id)

      if (currentItem && currentItem.productQuantity <= 1) {
        removeFullProduct(id)

        return
      }
      updateCartItem({ shoppingCartItemId: productCartSlotId, productQuantityChange: -1 }).catch(() => {})
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
    const token = useAuthStore?.getState?.()?.token ?? null

    if (token) {
      const { tempItems } = get()
      const productCartSlotId = getProductCartSlotId(id, tempItems)

      removeCartItem([productCartSlotId!])
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
        .catch(() => {})
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
  resetCart: () => set({ itemsIds: [], tempItems: [], count: 0, totalPrice: 0, isSync: false } as CartSliceState),
  setTempItems: (items) => set((state) => ({
    ...state,
    itemsIds: items.map((i) => ({ productId: i.productInfo.id, productQuantity: i.productQuantity })),
    tempItems: items,
    isSync: true,
    count: items.reduce((sum, i) => sum + i.productQuantity, 0),
    totalPrice: items.reduce((sum, i) => sum + i.productInfo.price * i.productQuantity, 0),
  })),
  createCart: async (reqItems: ICartPushItems): Promise<void> => {
    const mergedCart = await mergeCarts(reqItems)
    const { itemsTotalPrice, productsQuantity, items } = mergedCart

    set((state) => ({
      ...state,
      itemsIds: createItemsIdsFromCart(items),
      tempItems: items,
      count: productsQuantity,
      totalPrice: itemsTotalPrice,
      isSync: true,
    }))
  },
  updateCartItem: async (updatedItem: ICartUpdatedItem): Promise<void> => {
    const data = await changeCartItemQuantity(updatedItem)
    const { itemsTotalPrice, productsQuantity, items } = data
    const filteredItems = items.filter((item) => item.productQuantity > 0)

    set((state) => ({
      ...state,
      itemsIds: createItemsIdsFromCart(filteredItems),
      tempItems: filteredItems,
      count: productsQuantity,
      totalPrice: itemsTotalPrice,
    }))
  },
})

function addToCart(id: string, cartList: ICartPushItem[]): ICartPushItem[] {
  const cartItem = cartList.find((item) => item.productId === id)

  if (!cartItem) return [...cartList, { productId: id, productQuantity: 1 }]

  return cartList.map((item) =>
    item.productId === id ? { ...item, productQuantity: item.productQuantity + 1 } : item,
  )
}

function removeItem(id: string, cartList: ICartPushItem[]): ICartPushItem[] {
  return cartList
    .map((item) =>
      item.productId === id ? { ...item, productQuantity: item.productQuantity - 1 } : item,
    )
    .filter((item) => item.productQuantity)
}

function getProductsCount(cartList: ICartPushItem[]): number {
  return cartList.length ? cartList.reduce((prev, curr) => prev + curr.productQuantity, 0) : 0
}

function getTotalPrice(cartList: ICartItem[]): number {
  return cartList.length
    ? cartList.reduce((prev, curr) => prev + curr.productInfo.price * curr.productQuantity, 0)
    : 0
}

function getProductCartSlotId(id: string, cartList: ICartItem[]): string | undefined {
  return cartList.find((item) => item.productInfo.id === id)?.id
}

function createItemsIdsFromCart(cartItems: ICartItem[]): ICartPushItem[] {
  return cartItems.map((item) => ({
    productId: item.productInfo.id,
    productQuantity: item.productQuantity,
  }))
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
