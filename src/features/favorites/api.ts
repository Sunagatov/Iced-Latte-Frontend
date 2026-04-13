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

export async function removeFavourite(id: string): Promise<void> {
  await api.delete(`/favorites/${id}`)
}

export async function fetchFavourites(signal?: AbortSignal): Promise<IProduct[]> {
  const response: AxiosResponse<{ products: IProduct[] }> =
    await api.get('/favorites', { signal })

  return response.data?.products || []
}
