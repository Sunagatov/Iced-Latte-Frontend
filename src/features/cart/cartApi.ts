import type {
  ICart,
  ICartPushItems,
  ICartUpdatedItem,
} from '@/features/cart/cartTypes'
import {
  addNewItemToShoppingCart,
  deleteItemsFromShoppingCart,
  getShoppingCart,
  updateProductQuantityInShoppingCartItem,
} from '@/shared/api/generated/cart'

interface DeleteItemsPayload {
  shoppingCartItemIds: string[]
}

export async function mergeCarts(cartItemIds: ICartPushItems): Promise<ICart> {
  return addNewItemToShoppingCart(cartItemIds) as Promise<ICart>
}

export async function fetchCart(signal?: AbortSignal): Promise<ICart> {
  const options = { cache: false, signal }

  return getShoppingCart(options) as Promise<ICart>
}

export async function removeCartItem(ids: string[]): Promise<ICart> {
  const deleteItems: DeleteItemsPayload = { shoppingCartItemIds: ids }

  return deleteItemsFromShoppingCart(deleteItems) as Promise<ICart>
}

export async function changeCartItemQuantity(
  item: ICartUpdatedItem,
): Promise<ICart> {
  return updateProductQuantityInShoppingCartItem(item) as Promise<ICart>
}
