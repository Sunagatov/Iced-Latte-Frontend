import { ICartItem, ICartPushItem } from './types'

export type SetFn = {
  (partial: Partial<{ pendingProductIds: Set<string> }>): void
  (fn: (s: { pendingProductIds: Set<string> }) => { pendingProductIds: Set<string> }): void
}

export function addToCart(id: string, cartList: ICartPushItem[]): ICartPushItem[] {
  const cartItem = cartList.find((item) => item.productId === id)

  if (!cartItem) return [...cartList, { productId: id, productQuantity: 1 }]

  return cartList.map((item) =>
    item.productId === id
      ? { ...item, productQuantity: item.productQuantity + 1 }
      : item,
  )
}

export function removeItem(id: string, cartList: ICartPushItem[]): ICartPushItem[] {
  return cartList
    .map((item) =>
      item.productId === id
        ? { ...item, productQuantity: item.productQuantity - 1 }
        : item,
    )
    .filter((item) => item.productQuantity)
}

export function getProductsCount(cartList: ICartPushItem[]): number {
  return cartList.length
    ? cartList.reduce((prev, curr) => prev + curr.productQuantity, 0)
    : 0
}

export function getTotalPrice(cartList: ICartItem[]): number {
  return cartList.length
    ? cartList.reduce(
      (prev, curr) => prev + curr.productInfo.price * curr.productQuantity,
      0,
    )
    : 0
}

export function getProductCartSlotId(
  id: string,
  cartList: ICartItem[],
): string | undefined {
  return cartList.find((item) => item.productInfo.id === id)?.id
}

export function createItemsIdsFromCart(cartItems: ICartItem[]): ICartPushItem[] {
  return cartItems.map((item) => ({
    productId: item.productInfo.id,
    productQuantity: item.productQuantity,
  }))
}

export function setPending(
  set: (fn: (s: { pendingProductIds: Set<string> }) => { pendingProductIds: Set<string> }) => void,
  id: string,
): void {
  set((state) => {
    const next = new Set(state.pendingProductIds)

    next.add(id)

    return { pendingProductIds: next }
  })
}

export function clearPending(
  set: (fn: (s: { pendingProductIds: Set<string> }) => { pendingProductIds: Set<string> }) => void,
  id: string,
): void {
  set((state) => {
    const next = new Set(state.pendingProductIds)

    next.delete(id)

    return { pendingProductIds: next }
  })
}
