import {
  ICartItem,
  ICartPushItem,
  ICartPushItems,
  ICartUpdatedItem,
} from '@/types/Cart'
import { IProduct } from '@/types/Products'
import { getProductByIds } from '@/services/apiService'
import {
  changeCartItemQuantity,
  mergeCarts,
  removeCartItem,
} from '@/services/cartApiService'
import { StateCreator } from 'zustand'
import { useAuthStore } from '@/store/authStore'

export interface CartItem {
  id: string
  info: Omit<IProduct, 'id'>
  quantity: number
}

interface CartSliceState {
  itemsIds: ICartPushItem[]
  tempItems: ICartItem[]
  items: CartItem[]
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

  // helper functions to update state
  createCart: (token: string, reqItems: ICartPushItems) => Promise<void>
  updateCartItem: (
    token: string,
    updatedItem: ICartUpdatedItem,
  ) => Promise<void>
}

export type CartSliceStore = CartSliceState & CartSliceActions

const initialState: CartSliceState = {
  itemsIds: [],
  items: [],
  tempItems: [],
  count: 0,
  totalPrice: 0,
  isSync: false,
}

export const createCartSlice: StateCreator<
  CartSliceStore,
  [],
  [],
  CartSliceStore
> = (set, get) => ({
  ...initialState,
  add: (id: string) => {
    const { itemsIds, tempItems, updateCartItem, createCart } = get()
    const token = useAuthStore?.getState?.()?.token ?? null
    const cartItem = itemsIds.find((item) => item.productId === id)

    if (token) {
      if (cartItem) {
        const productCartSlotId = getProductCartSlotId(id, tempItems)
        if (!productCartSlotId) return
        const itemChanges: ICartUpdatedItem = {
          shoppingCartItemId: productCartSlotId,
          productQuantityChange: 1,
        }

        updateCartItem(token, itemChanges).catch((e) => {
          console.error('Failed to update cart item:', (e as Error).message)
        })
      } else {
        const reqItems: ICartPushItems = {
          items: [{ productId: id, productQuantity: 1 }],
        }

        createCart(token, reqItems).catch((e) => {
          console.error('Failed to create cart:', (e as Error).message)
        })
      }
    } else {
      const updatedCart = addToCart(id, itemsIds)
      const count = getProductsCount(updatedCart)

      if (!cartItem) {
        set((state) => ({
          ...state,
          itemsIds: updatedCart,
          count,
        }))

        return
      }

      const updatedTempItems = tempItems.map((tempItem) =>
        tempItem.productInfo.id === id
          ? { ...tempItem, productQuantity: tempItem.productQuantity + 1 }
          : tempItem,
      )

      const totalPrice = getTotalPrice(updatedTempItems)

      set((state) => ({
        ...state,
        itemsIds: updatedCart,
        tempItems: updatedTempItems,
        count,
        totalPrice,
      }))
    }
  },
  getCartItems: async () => {
    try {
      const { itemsIds } = get()
      const ids = itemsIds.map((item) => item.productId)
      const productList = await getProductByIds(ids)
      const cartItems: ICartItem[] = productList.map((item) => {
        const quantity = itemsIds.find(
          (idsItem) => idsItem.productId === item.id,
        )!.productQuantity

        return {
          id: item.id,
          productInfo: { ...item },
          productQuantity: quantity,
        }
      })

      const totalPrice = getTotalPrice(cartItems)

      set((state) => ({ ...state, tempItems: cartItems, totalPrice }))
    } catch (e) {
      throw new Error((e as Error).message)
    }
  },
  syncBackendCart: async (token: string) => {
    try {
      const { createCart } = get()
      const { itemsIds } = get()
      const reqItems: ICartPushItems = { items: itemsIds }

      await createCart(token, reqItems)
    } catch (e) {
      throw new Error((e as Error).message)
    }
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

      const itemChanges: ICartUpdatedItem = {
        shoppingCartItemId: productCartSlotId,
        productQuantityChange: -1,
      }

      updateCartItem(token, itemChanges).catch((e) => {
        console.error('Failed to update cart item:', (e as Error).message)
      })
    } else {
      const updatedCart = removeItem(id, itemsIds)
      const count = getProductsCount(updatedCart)

      const updatedTempItems = tempItems
        .map((tempItem) =>
          tempItem.productInfo.id === id
            ? { ...tempItem, productQuantity: tempItem.productQuantity - 1 }
            : tempItem,
        )
        .filter((tempItem) => tempItem.productQuantity > 0)

      const totalPrice = getTotalPrice(updatedTempItems)

      set((state) => ({
        ...state,
        itemsIds: updatedCart,
        tempItems: updatedTempItems,
        count,
        totalPrice,
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
          const newItemsIds = createItemsIdsFromCart(items)

          set((state) => ({
            ...state,
            itemsIds: newItemsIds,
            tempItems: items,
            count: productsQuantity,
            totalPrice: itemsTotalPrice,
          }))
        })
        .catch((e) => console.log(e))
    } else {
      const { itemsIds, tempItems } = get()
      const updatedCart = removeFullProduct(id, itemsIds)
      const removedTempItems = tempItems.filter(
        (item) => item.productInfo.id !== id,
      )
      const count = getProductsCount(updatedCart)
      const totalPrice = getTotalPrice(tempItems)

      set(
        (state) =>
          ({
            itemsIds: updatedCart,
            items: state.items,
            tempItems: removedTempItems,
            count,
            totalPrice,
          }) as CartSliceState,
      )
    }
  },
  resetCart: () => {
    set({
      itemsIds: [],
      items: [],
      tempItems: [],
      count: 0,
      totalPrice: 0,
      isSync: false,
    } as CartSliceState)
  },
  setTempItems: (items) => {
    set((state) => ({ ...state, tempItems: items }))
  },

  createCart: async (
    token: string,
    reqItems: ICartPushItems,
  ): Promise<void> => {
    try {
      const mergedCart = await mergeCarts(reqItems)
      const { itemsTotalPrice, productsQuantity, items } = mergedCart
      const newItemsIds = createItemsIdsFromCart(items)

      set((state) => ({
        ...state,
        itemsIds: newItemsIds,
        tempItems: items,
        count: productsQuantity,
        totalPrice: itemsTotalPrice,
        isSync: true,
      }))
    } catch (e) {
      throw new Error((e as Error).message)
    }
  },
  updateCartItem: async (
    token: string,
    updatedItem: ICartUpdatedItem,
  ): Promise<void> => {
    try {
      const data = await changeCartItemQuantity(updatedItem)

      const { itemsTotalPrice, productsQuantity, items } = data
      const filteredItems = items.filter((item) => item.productQuantity > 0)
      const newItemsIds = createItemsIdsFromCart(filteredItems)

      set((state) => ({
        ...state,
        itemsIds: newItemsIds,
        tempItems: filteredItems,
        count: productsQuantity,
        totalPrice: itemsTotalPrice,
      }))
    } catch (e) {
      throw new Error((e as Error).message)
    }
  },
})

function addToCart(id: string, cartList: ICartPushItem[]): ICartPushItem[] {
  const cartItem = cartList.find((item) => item.productId === id)

  if (!cartItem) return [...cartList, { productId: id, productQuantity: 1 }]
  else {
    return cartList.map((item) => {
      if (item.productId === id)
        return { ...item, productQuantity: item.productQuantity + 1 }

      return item
    })
  }
}

function removeItem(id: string, cartList: ICartPushItem[]): ICartPushItem[] {
  return cartList
    .map((item) => {
      if (item.productId === id)
        return { ...item, productQuantity: item.productQuantity - 1 }

      return item
    })
    .filter((item) => item.productQuantity)
}

function removeFullProduct(
  id: string,
  cartList: ICartPushItem[],
): ICartPushItem[] {
  return cartList.filter((item) => item.productId !== id)
}

function getProductsCount(cartList: ICartPushItem[]): number {
  if (cartList.length)
    return cartList.reduce((prev, curr) => prev + curr.productQuantity, 0)

  return 0
}

function getTotalPrice(cartList: ICartItem[]): number {
  if (cartList.length)
    return cartList.reduce(
      (prev, current) =>
        prev + current.productInfo.price * current.productQuantity,
      0,
    )

  return 0
}

//utility

function getProductCartSlotId(
  id: string,
  cartList: ICartItem[],
): string | undefined {
  return cartList.find((item) => item.productInfo.id === id)?.id
}

function createItemsIdsFromCart(cartItems: ICartItem[]): ICartPushItem[] {
  return cartItems.map(
    (item) =>
      ({
        productId: item.productInfo.id,
        productQuantity: item.productQuantity,
      }) as ICartPushItem,
  )
}
