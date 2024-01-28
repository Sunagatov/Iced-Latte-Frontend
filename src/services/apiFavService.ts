import { AxiosResponse } from 'axios'
import { FavResponse, IFavPushItems } from '@/types/Fav'
import { IProduct } from '@/types/Products'
import { api, setAuth } from './apiConfig/apiConfig'

export async function mergeFavs(
  token: string,
  requestItems: IFavPushItems,
): Promise<FavResponse> {
  try {
    setAuth(token)

    const response: AxiosResponse<FavResponse> = await api.post(
      '/favorites',
      requestItems,
    )

    return response.data
  } catch (error) {
    throw error instanceof Error
      ? error
      : new Error('An unknown error occurred')
  }
}

export async function removeFavItem(
  token: string,
  id: string,
): Promise<FavResponse> {
  try {
    setAuth(token)

    const response: AxiosResponse<FavResponse> = await api.delete(
      `/favorites/${id}`,
    )

    return response.data
  } catch (error) {
    throw error instanceof Error
      ? error
      : new Error('An unknown error occurred')
  }
}

export async function getFavByIds(token: string): Promise<IProduct[]> {
  try {
    setAuth(token)

    const response: AxiosResponse<IProduct[]> = await api.get('/favorites')

    return response.data
  } catch (error) {
    throw error instanceof Error
      ? error
      : new Error('An unknown error occurred')
  }
}
