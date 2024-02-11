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
  add: (id: string, token: string | null) => void
  remove: (id: string, token: string | null) => void
  getCartItems: () => Promise<void>
  syncBackendCart: (token: string) => Promise<void>
  removeFullProduct: (id: string, token: string | null) => void
  resetCart: () => void

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
  add: (id: string, token: string | null) => {
    const { itemsIds, tempItems, updateCartItem, createCart } = get()
    const cartItem = itemsIds.find((item) => item.productId === id)

    if (token) {
      if (cartItem) {
        const productCartSlotId = getProductCartSlotId(id, tempItems)
        const itemChanges: ICartUpdatedItem = {
          shoppingCartItemId: productCartSlotId!,
          productQuantityChange: 1,
        }

        updateCartItem(token, itemChanges).catch((e) => {
          throw new Error((e as Error).message)
        })
      } else {
        const reqItems: ICartPushItems = {
          items: [{ productId: id, productQuantity: 1 }],
        }

        createCart(token, reqItems).catch((e) => {
          throw new Error((e as Error).message)
        })
      }
    } else {
      const updatedCart = addToCart(id, itemsIds)

      set(
        (state) =>
          ({
            ...state,
            itemsIds: updatedCart,
            items: state.items,
            tempItems: state.tempItems,
            count: state.count + 1,
          }) as CartSliceState,
      )
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
  remove: (id: string, token: string | null) => {
    if (token) {
      const { tempItems, updateCartItem } = get()
      const productCartSlotId = getProductCartSlotId(id, tempItems)
      const itemChanges: ICartUpdatedItem = {
        shoppingCartItemId: productCartSlotId!,
        productQuantityChange: -1,
      }

      updateCartItem(token, itemChanges).catch((e) => {
        throw new Error((e as Error).message)
      })
    } else {
      const { tempItems, itemsIds } = get()

      const updatedCart = removeItem(id, itemsIds)
      const totalPrice = getTotalPrice(tempItems)

      set(
        (state) =>
          ({
            ...state,
            itemsIds: updatedCart,
            items: state.items,
            count: state.count - 1,
            totalPrice,
          }) as CartSliceState,
      )
    }
  },
  removeFullProduct: (id: string, token: string | null) => {
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

      const newItemsIds = createItemsIdsFromCart(items)

      set((state) => ({
        ...state,
        itemsIds: newItemsIds,
        tempItems: items,
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
