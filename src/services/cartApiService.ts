import { AxiosResponse } from 'axios'
import { ICart, ICartPushItems, ICartUpdatedItem } from '@/types/Cart'
import { api, setAuth } from './apiConfig/apiConfig'

interface IDeleteItems {
  shoppingCartItemIds: string[]
}

export async function mergeCarts(
  token: string,
  cartItemIds: ICartPushItems,
): Promise<ICart> {
  try {
    setAuth(token)

    const response: AxiosResponse<ICart> = await api.post(
      '/cart/items',
      cartItemIds,
    )

    return response.data
  } catch (error) {
    throw error instanceof Error
      ? error
      : new Error('An unknown error occurred')
  }
}

export async function fetchCart(token: string): Promise<ICart> {
  try {
    setAuth(token)

    const response: AxiosResponse<ICart> = await api.get('/cart')

    return response.data
  } catch (error) {
    throw error instanceof Error
      ? error
      : new Error('An unknown error occurred')
  }
}

export async function removeCartItem(
  token: string,
  ids: string[],
): Promise<ICart> {
  try {
    const deleteItems: IDeleteItems = { shoppingCartItemIds: ids }

    setAuth(token)

    const response: AxiosResponse<ICart> = await api.delete('/cart/items', {
      data: deleteItems,
    })

    return response.data
  } catch (error) {
    throw error instanceof Error
      ? error
      : new Error('An unknown error occurred')
  }
}

export async function changeCartItemQuantity(
  token: string,
  item: ICartUpdatedItem,
): Promise<ICart> {
  try {
    setAuth(token)

    const response: AxiosResponse<ICart> = await api.patch('/cart/items', item)

    return response.data
  } catch (error) {
    throw error instanceof Error
      ? error
      : new Error('An unknown error occurred')
  }
}
