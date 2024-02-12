import { AxiosResponse } from 'axios'
import { FavResponse, IFavPushItems } from '@/types/Fav'
import { IProduct } from '@/types/Products'
import { api } from './apiConfig/apiConfig'

export async function mergeFavs(
  requestItems: IFavPushItems,
): Promise<FavResponse> {
  const response: AxiosResponse<FavResponse> = await api.post(
    '/favorites',
    requestItems,
  )

  return response.data
}

export async function removeFavItem(id: string): Promise<FavResponse> {
  const response: AxiosResponse<FavResponse> = await api.delete(
    `/favorites/${id}`,
  )

  return response.data
}

export async function getFavByIds(): Promise<IProduct[]> {
  const response: AxiosResponse<{ products: IProduct[] }> =
    await api.get('/favorites')

  return response.data?.products || []
}
