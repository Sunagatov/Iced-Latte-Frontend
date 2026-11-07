import { executeCommand, readConfirmed } from '@/features/session/syncCommands'
import type {
  ICart,
  ICartPushItems,
  ICartUpdatedItem,
} from '@/features/cart/cartTypes'
export async function mergeCarts(
  cartItemIds: ICartPushItems,
  signal?: AbortSignal,
  idempotencyKey?: string,
): Promise<ICart> {
  if (signal?.aborted) throw new DOMException('Aborted', 'AbortError')

  return executeCommand<ICart>(
    'cart',
    idempotencyKey ? 'merge' : 'add',
    { items: cartItemIds.items },
    { operationId: idempotencyKey },
  )
}

export async function fetchCart(signal?: AbortSignal): Promise<ICart> {
  if (signal?.aborted) throw new DOMException('Aborted', 'AbortError')

  return readConfirmed<ICart>('cart')
}

export async function removeCartItem(
  ids: string[],
  productIds?: string[],
): Promise<ICart> {
  return executeCommand<ICart>(
    'cart',
    productIds ? 'clear' : 'remove-slots',
    productIds ? { productIds } : { slotIds: ids },
  )
}

export async function changeCartItemQuantity(
  item: ICartUpdatedItem,
): Promise<ICart> {
  const productId =
    item.productId ??
    (await fetchCart()).items.find((row) => row.id === item.shoppingCartItemId)
      ?.productInfo.id

  if (!productId)
    throw new Error(
      'This product is no longer in your cart. Refresh and try again.',
    )

  return executeCommand<ICart>('cart', 'adjust', {
    productId,
    quantity: item.productQuantityChange,
  })
}
