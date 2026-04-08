import { AxiosResponse } from 'axios'
import { FavouritesResponse, SyncFavouritesRequest } from './types'
import { IProduct } from '@/features/products/types'
import { api } from '@/shared/api/client'

export async function syncFavourites(
  requestItems: SyncFavouritesRequest,
): Promise<FavouritesResponse> {
  const response: AxiosResponse<FavouritesResponse> = await api.post(
    '/favorites',
    requestItems,
  )

  return response.data
}

export async function removeFavourite(id: string): Promise<FavouritesResponse> {
  const response: AxiosResponse<FavouritesResponse> = await api.delete(
    `/favorites/${id}`,
  )

  return response.data
}

export async function fetchFavourites(): Promise<IProduct[]> {
  const response: AxiosResponse<{ products: IProduct[] }> =
    await api.get('/favorites')

  return response.data?.products || []
}
