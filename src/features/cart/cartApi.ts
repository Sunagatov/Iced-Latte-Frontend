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
  return (await addNewItemToShoppingCart(cartItemIds)) as ICart
}

export async function fetchCart(signal?: AbortSignal): Promise<ICart> {
  const options = { cache: false, signal }

  return (await getShoppingCart(options)) as ICart
}

export async function removeCartItem(ids: string[]): Promise<ICart> {
  const deleteItems: DeleteItemsPayload = { shoppingCartItemIds: ids }

  return (await deleteItemsFromShoppingCart(deleteItems)) as ICart
}

export async function changeCartItemQuantity(
  item: ICartUpdatedItem,
): Promise<ICart> {
  return (await updateProductQuantityInShoppingCartItem(item)) as ICart
}
