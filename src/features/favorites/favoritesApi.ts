import type {
  FavoriteProduct,
  FavouritesResponse,
  SyncFavouritesRequest,
} from '@/features/favorites/favoritesTypes'
import {
  addListOfFavoriteProducts,
  getListOfFavoriteProducts,
  removeProductFromFavorite,
} from '@/shared/api/generated/favorite'

export async function syncFavourites(
  requestItems: SyncFavouritesRequest,
): Promise<FavouritesResponse> {
  return (await addListOfFavoriteProducts(requestItems)) as FavouritesResponse
}

export async function removeFavourite(id: string): Promise<void> {
  await removeProductFromFavorite(id)
}

export async function fetchFavourites(signal?: AbortSignal): Promise<FavoriteProduct[]> {
  const options = { cache: false, signal }
  const response = await getListOfFavoriteProducts(options) as FavouritesResponse

  return response.products || []
}
