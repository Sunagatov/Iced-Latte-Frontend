import { ErrorResponse } from '@/models/ErrorResponse'
import { handleResponse } from '@/utils/handleResponse'
import { ServerError } from './authService'
import { IProduct } from '@/models/Products'

interface FavResponse {
  products: IProduct[]
}

interface IFavPushItems {
  favouriteIds: string[]
}

export async function mergeFavs(
  token: string,
  favouriteIds: IFavPushItems,
): Promise<FavResponse> {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_HOST_REMOTE}/favourites`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(favouriteIds),
      },
    )

    return handleResponse<FavResponse, ErrorResponse>(response)
  } catch (error) {
    throw new ServerError('Something went wrong')
  }
}
