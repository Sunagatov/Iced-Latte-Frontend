import { ErrorResponse } from '@/types/ErrorResponse'
import { handleResponse } from '@/utils/handleResponse'
import { ServerError } from './authService'
import { FavResponse, IFavPushItems } from '@/types/Fav'
import { IProduct } from '@/types/Products'

export async function mergeFavs(
  token: string,
  requestItems: IFavPushItems,
): Promise<FavResponse> {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_HOST_REMOTE}/favorites`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestItems),
      },
    )

    return handleResponse<FavResponse, ErrorResponse>(response)
  } catch (error) {
    throw new ServerError('Something went wrong')
  }
}

export async function removeFavItem(
  token: string,
  id: string,
): Promise<FavResponse> {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_HOST_REMOTE}/favorites/${id}`,
      {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      },
    )

    return handleResponse<FavResponse, ErrorResponse>(response)
  } catch (error) {
    throw new ServerError('Something went wrong')
  }
}

export async function getFavByIds(token: string): Promise<IProduct[]> {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_HOST_REMOTE}/favorites`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      },
    )

    return handleResponse<IProduct[], ErrorResponse>(response)
  } catch (error) {
    throw new ServerError('Something went wrong')
  }
}
