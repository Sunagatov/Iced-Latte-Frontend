import type {
  ICartItem,
  ICartPushItem,
} from '@/features/cart/cartTypes'

export const MAX_CART_ITEM_QUANTITY = 99

export type SetFn = {
  (partial: Partial<{ pendingProductIds: Set<string> }>): void
  (fn: (s: { pendingProductIds: Set<string> }) => {
    pendingProductIds: Set<string>
  }): void
}

export function addToCart(
  id: string,
  cartList: ICartPushItem[],
): ICartPushItem[] {
  const normalizedCartList = normalizeCartItems(cartList)
  const cartItem = normalizedCartList.find((item) => item.productId === id)

  if (!cartItem) {
    return [...normalizedCartList, { productId: id, productQuantity: 1 }]
  }

  return normalizedCartList.map((item) =>
    item.productId === id
      ? {
        ...item,
        productQuantity: Math.min(
          item.productQuantity + 1,
          MAX_CART_ITEM_QUANTITY,
        ),
      }
      : item,
  )
}

export function removeItem(
  id: string,
  cartList: ICartPushItem[],
): ICartPushItem[] {
  return cartList
    .map((item) =>
      item.productId === id
        ? { ...item, productQuantity: item.productQuantity - 1 }
        : item,
    )
    .filter((item) => item.productQuantity > 0)
}

export function getProductsCount(cartList: ICartPushItem[]): number {
  return normalizeCartItems(cartList).reduce(
    (prev, curr) => prev + curr.productQuantity,
    0,
  )
}

export function getTotalPrice(cartList: ICartItem[]): number {
  return normalizeCartItemList(cartList).reduce(
    (prev, curr) => prev + curr.productInfo.price * curr.productQuantity,
    0,
  )
}

export function getProductCartSlotId(
  id: string,
  cartList: ICartItem[],
): string | undefined {
  return cartList.find((item) => item.productInfo.id === id)?.id
}

export function createItemsIdsFromCart(cartItems: ICartItem[]): ICartPushItem[] {
  return normalizeCartItems(normalizeCartItemList(cartItems).map((item) => ({
    productId: item.productInfo.id,
    productQuantity: item.productQuantity,
  })))
}

export function normalizeCartItems(cartItems: ICartPushItem[]): ICartPushItem[] {
  const quantitiesByProductId = new Map<string, number>()

  cartItems.forEach((item) => {
    const productQuantity = Math.min(
      Math.max(Math.trunc(item.productQuantity), 0),
      MAX_CART_ITEM_QUANTITY,
    )

    if (productQuantity <= 0) return

    const currentQuantity = quantitiesByProductId.get(item.productId) ?? 0

    quantitiesByProductId.set(
      item.productId,
      Math.min(currentQuantity + productQuantity, MAX_CART_ITEM_QUANTITY),
    )
  })

  return Array.from(quantitiesByProductId, ([productId, productQuantity]) => ({
    productId,
    productQuantity,
  }))
}

export function normalizeCartItemList(cartItems: ICartItem[]): ICartItem[] {
  const itemsByProductId = new Map<string, ICartItem>()

  cartItems.forEach((item) => {
    const productQuantity = Math.min(
      Math.max(Math.trunc(item.productQuantity), 0),
      MAX_CART_ITEM_QUANTITY,
    )

    if (productQuantity <= 0) return

    const productId = item.productInfo.id
    const existingItem = itemsByProductId.get(productId)

    if (!existingItem) {
      itemsByProductId.set(productId, { ...item, productQuantity })

      return
    }

    itemsByProductId.set(productId, {
      ...existingItem,
      productQuantity: Math.min(
        existingItem.productQuantity + productQuantity,
        MAX_CART_ITEM_QUANTITY,
      ),
    })
  })

  return Array.from(itemsByProductId.values())
}

export function setPending(
  set: (fn: (s: { pendingProductIds: Set<string> }) => {
    pendingProductIds: Set<string>
  }) => void,
  id: string,
): void {
  set((state) => {
    const next = new Set(state.pendingProductIds)

    next.add(id)

    return { pendingProductIds: next }
  })
}

export function clearPending(
  set: (fn: (s: { pendingProductIds: Set<string> }) => {
    pendingProductIds: Set<string>
  }) => void,
  id: string,
): void {
  set((state) => {
    const next = new Set(state.pendingProductIds)

    next.delete(id)

    return { pendingProductIds: next }
  })
}
