import { AxiosResponse } from 'axios'
import { FavResponse, IFavPushItems } from '@/types/Fav'
import { IProduct } from '@/types/Products'
import { api } from './apiConfig/apiConfig'

export async function mergeFavs(
  token: string,
  requestItems: IFavPushItems,
): Promise<FavResponse> {
  try {
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

export async function removeFavItem(id: string): Promise<FavResponse> {
  try {
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

export async function getFavByIds(): Promise<IProduct[]> {
  try {
    const response: AxiosResponse<IProduct[]> = await api.get('/favorites')

    return response.data
  } catch (error) {
    throw error instanceof Error
      ? error
      : new Error('An unknown error occurred')
  }
}
