import { useAuthStore } from '@/features/auth/store'
import {
  removeFavourite,
  syncFavourites,
} from '@/features/favorites/api/favoritesApi'
import {
  clearPendingFavourite,
  restoreRemovedFavourite,
  setPendingFavourite,
} from '@/features/favorites/favorites.state'
import type { FavGet, FavSet } from '@/features/favorites/favorites.service.types'
import {
  mapProductsToFavourites,
  uniqueIds,
} from '@/features/favorites/state/favoritesStore.utils'
import { getProductByIds } from '@/features/products/public'

export async function toggleFavouriteInStore(
  set: FavSet,
  get: FavGet,
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
  } catch {
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
