import type {
  FavoriteProduct,
  FavouritesResponse,
  SyncFavouritesRequest,
} from '@/features/favorites/favoritesTypes'
import { executeCommand, readConfirmed } from '@/features/session/syncCommands'

export async function syncFavourites(
  requestItems: SyncFavouritesRequest,
  signal?: AbortSignal,
  operationId?: string,
): Promise<FavouritesResponse> {
  if (signal?.aborted) throw new DOMException('Aborted', 'AbortError')

  return executeCommand<FavouritesResponse>(
    'favourites',
    operationId ? 'merge' : 'save',
    operationId
      ? { productIds: requestItems.productIds }
      : { productId: requestItems.productIds[0], saved: true },
    { operationId },
  )
}

export async function removeFavourite(id: string): Promise<void> {
  await executeCommand('favourites', 'save', { productId: id, saved: false })
}

export async function fetchFavourites(
  signal?: AbortSignal,
): Promise<FavoriteProduct[]> {
  if (signal?.aborted) throw new DOMException('Aborted', 'AbortError')
  const response = await readConfirmed<FavouritesResponse>('favourites')

  return response.products || []
}
