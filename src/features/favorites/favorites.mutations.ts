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
  restoreRemovedFavourite,
  setPendingFavourite,
  uniqueIds,
} from '@/features/favorites/state/favoritesStore.utils'
import { getProductByIds } from '@/features/products/api'
import { toastError } from '@/shared/utils/apiError'

export async function toggleFavouriteInStore(
  set: FavStoreSet,
  get: FavStoreGet,
  productId: string,
): Promise<void> {
  const { pendingIds, favouriteIds, favourites } = get()

  if (pendingIds.has(productId)) {
    return
  }

  const isAuthenticated = useAuthStore.getState().status === 'authenticated'
  const wasAdded = !favouriteIds.includes(productId)
  const previousProduct =
    favourites.find((product) => product.id === productId) ?? null

  setPendingFavourite(set, productId)
  set((state) =>
    wasAdded
      ? { favouriteIds: uniqueIds([...state.favouriteIds, productId]) }
      : {
        favouriteIds: state.favouriteIds.filter((id) => id !== productId),
        favourites: state.favourites.filter((product) => product.id !== productId),
      },
  )

  try {
    if (isAuthenticated) {
      if (wasAdded) {
        const response = await syncFavourites({ productIds: [productId] })

        set(mapProductsToFavourites(response.products))
      } else {
        await removeFavourite(productId)
      }

      return
    }

    if (wasAdded) {
      const products = await getProductByIds(uniqueIds(get().favouriteIds))

      set(mapProductsToFavourites(products))
    }
  } catch (err) {
    toastError(err)
    set((state) =>
      wasAdded
        ? {
          favouriteIds: state.favouriteIds.filter((id) => id !== productId),
          favourites: state.favourites.filter((product) => product.id !== productId),
        }
        : {
          favouriteIds: uniqueIds([...state.favouriteIds, productId]),
          favourites: restoreRemovedFavourite(state.favourites, previousProduct),
        },
    )
  } finally {
    clearPendingFavourite(set, productId)
  }
}
