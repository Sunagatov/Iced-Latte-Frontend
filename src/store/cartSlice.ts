import { IProduct } from '@/models/Products'
import { StateCreator } from 'zustand'

export interface CartItem {
  id: string
  info: Omit<IProduct, 'id'>
  quantity: number
}

interface CartSliceState {
  items: CartItem[]
  count: number
  totalPrice: number
}

interface CartSliceActions {
  add: (product: CartItem) => void
  remove: (id: string) => void
  removeFullProduct: (id: string) => void
  resetCart: () => void
}

export type CartSliceStore = CartSliceState & CartSliceActions

const initialState: CartSliceState = { items: [], count: 0, totalPrice: 0 }

export const createCartSlice: StateCreator<
  CartSliceStore,
  [],
  [],
  CartSliceStore
> = (set, get) => ({
  ...initialState,
  add: (product: CartItem) => {
    const { items } = get()
    const updatedCart = addToCart(product, items)
    const totalPrice = getTotalPrice(updatedCart)

    set((state) => ({ items: updatedCart, count: state.count + 1, totalPrice }))
  },
  remove: (id: string) => {
    const { items } = get()

    const updatedCart = removeItem(id, items)
    const totalPrice = getTotalPrice(updatedCart)

    set((state) => ({ items: updatedCart, count: state.count - 1, totalPrice }))
  },
  removeFullProduct: (id: string) => {
    const { items } = get()

    const updatedCart = removeFullProduct(id, items)
    const count = getProductsCount(updatedCart)
    const totalPrice = getTotalPrice(updatedCart)

    set({ items: updatedCart, count, totalPrice } as CartSliceState)
  },
  resetCart: () => {
    set({ items: [], count: 0, totalPrice: 0 } as CartSliceState)
  },
})

function addToCart(product: CartItem, cartList: CartItem[]): CartItem[] {
  const cartItem: CartItem = {
    ...product,
    info: { ...product.info },
    quantity: 1,
  }

  const productOnCart = cartList.find((item) => item.id === product.id)

  if (!productOnCart) return [...cartList, cartItem]
  else {
    return cartList.map((item) => {
      if (item.id === product.id)
        return { ...item, info: { ...item.info }, quantity: item.quantity + 1 }

      return item
    })
  }
}

function removeItem(id: string, cartList: CartItem[]): CartItem[] {
  return cartList
    .map((item) => {
      if (item.id === id) return { ...item, quantity: item.quantity - 1 }

      return item
    })
    .filter((item) => item.quantity)
}

function removeFullProduct(id: string, cartList: CartItem[]): CartItem[] {
  return cartList.filter((item) => item.id !== id)
}

function getProductsCount(cartList: CartItem[]): number {
  if (cartList.length)
    return cartList.reduce((prev, curr) => prev + curr.quantity, 0)

  return 0
}

function getTotalPrice(cartList: CartItem[]): number {
  if (cartList.length)
    return cartList.reduce(
      (prev, current) => prev + current.info.price * current.quantity,
      0,
    )

  return 0
}
