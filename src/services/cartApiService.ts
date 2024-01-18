import { ICart, ICartPushItems, ICartUpdatedItem } from '@/types/Cart'
import { ErrorResponse } from '@/types/ErrorResponse'
import { handleResponse } from '@/utils/handleResponse'
import { ServerError } from './authService'

interface IDeleteItems {
  shoppingCartItemIds: string[]
}

export async function mergeCarts(
  token: string,
  cartItemIds: ICartPushItems,
): Promise<ICart> {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_HOST_REMOTE}/cart/items`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(cartItemIds),
      },
    )

    return handleResponse<ICart, ErrorResponse>(response)
  } catch (error) {
    throw new ServerError('Something went wrong')
  }
}

export async function fetchCart(token: string): Promise<ICart> {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_HOST_REMOTE}/cart`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      },
    )

    return handleResponse<ICart, ErrorResponse>(response)
  } catch (error) {
    throw new ServerError('Something went wrong')
  }
}

export async function removeCartItem(
  token: string,
  ids: string[],
): Promise<ICart> {
  try {
    const deleteItems: IDeleteItems = { shoppingCartItemIds: ids }
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_HOST_REMOTE}/cart/items`,
      {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(deleteItems),
      },
    )

    return handleResponse<ICart, ErrorResponse>(response)
  } catch (error) {
    throw new ServerError('Something went wrong')
  }
}

export async function changeCartItemQuantity(
  token: string,
  item: ICartUpdatedItem,
): Promise<ICart> {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_HOST_REMOTE}/cart/items`,
      {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(item),
      },
    )

    return handleResponse<ICart, ErrorResponse>(response)
  } catch (error) {
    throw new ServerError('Something went wrong')
  }
}
