import { useAuthStore } from '@/features/auth/store'
import {
  removeFavourite,
  syncFavourites,
} from '@/features/favorites/favoritesApi'
import {
  clearPendingFavourite,
  type FavStoreGet,
  type FavStoreSet,
  mapProductsToFavourites,
  normalizeFavouriteIds,
  restoreRemovedFavourite,
  setPendingFavourite,
} from '@/features/favorites/state/favoritesStore.utils'
import { getProductByIds } from '@/features/products/api'
import { toastError } from '@/shared/utils/apiError'

export async function toggleFavouriteInStore(
  set: FavStoreSet,
  get: FavStoreGet,
  productId: string,
): Promise<void> {
  const [normalizedProductId] = normalizeFavouriteIds([productId])

  if (!normalizedProductId) {
    return
  }

  const { pendingIds, favouriteIds, favourites } = get()

  if (pendingIds.has(normalizedProductId)) {
    return
  }

  const isAuthenticated = useAuthStore.getState().status === 'authenticated'
  const normalizedFavouriteIds = normalizeFavouriteIds(favouriteIds)
  const wasAdded = !normalizedFavouriteIds.includes(normalizedProductId)
  const previousProduct =
    favourites.find((product) => product.id === normalizedProductId) ?? null

  setPendingFavourite(set, normalizedProductId)
  set((state) =>
    wasAdded
      ? {
        favouriteIds: normalizeFavouriteIds([
          ...state.favouriteIds,
          normalizedProductId,
        ]),
      }
      : {
        favouriteIds: normalizeFavouriteIds(state.favouriteIds).filter(
          (id) => id !== normalizedProductId,
        ),
        favourites: state.favourites.filter(
          (product) => product.id !== normalizedProductId,
        ),
      },
  )

  try {
    if (isAuthenticated) {
      if (wasAdded) {
        const response = await syncFavourites({ productIds: [normalizedProductId] })

        set(mapProductsToFavourites(response.products))
      } else {
        await removeFavourite(normalizedProductId)
      }

      return
    }

    if (wasAdded) {
      const products = await getProductByIds(normalizeFavouriteIds(get().favouriteIds))

      set(mapProductsToFavourites(products))
    }
  } catch (err) {
    toastError(err)
    set((state) =>
      wasAdded
        ? {
          favouriteIds: normalizeFavouriteIds(state.favouriteIds).filter(
            (id) => id !== normalizedProductId,
          ),
          favourites: state.favourites.filter(
            (product) => product.id !== normalizedProductId,
          ),
        }
        : {
          favouriteIds: normalizeFavouriteIds([
            ...state.favouriteIds,
            normalizedProductId,
          ]),
          favourites: restoreRemovedFavourite(state.favourites, previousProduct),
        },
    )
  } finally {
    clearPendingFavourite(set, normalizedProductId)
  }
}
