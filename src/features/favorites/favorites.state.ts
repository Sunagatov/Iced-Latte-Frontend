import type { FavSet } from '@/features/favorites/favorites.service.types'
import { mapProductsToFavourites } from '@/features/favorites/state/favoritesStore.utils'
import type { IProduct } from '@/features/products/public'

export function setPendingFavourite(
  set: FavSet,
  productId: string,
): void {
  set((state) => {
    const pendingIds = new Set(state.pendingIds)

    pendingIds.add(productId)

    return { pendingIds }
  })
}

export function clearPendingFavourite(
  set: FavSet,
  productId: string,
): void {
  set((state) => {
    const pendingIds = new Set(state.pendingIds)

    pendingIds.delete(productId)

    return { pendingIds }
  })
}

export function restoreRemovedFavourite(
  favourites: IProduct[],
  previousProduct: IProduct | null,
): IProduct[] {
  return previousProduct
    ? mapProductsToFavourites([...favourites, previousProduct]).favourites
    : favourites
}
