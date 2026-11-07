import {
  removeFavourite,
  syncFavourites,
} from '@/features/favorites/favoritesApi'
import {
  clearPendingFavourite,
  type FavStoreGet,
  type FavStoreSet,
  normalizeFavouriteIds,
  normalizeProducts,
  restoreRemovedFavourite,
  setPendingFavourite,
} from '@/features/favorites/state/favoritesStore.utils'
import { getProductByIds } from '@/features/products/api'
import { toastError } from '@/shared/utils/apiError'
import { captureAccountScope } from '@/features/auth/accountScope'

export async function toggleFavouriteInStore(
  set: FavStoreSet,
  get: FavStoreGet,
  productId: string,
  isAuthenticated: boolean,
): Promise<void> {
  const account = captureAccountScope()
  const [normalizedProductId] = normalizeFavouriteIds([productId])

  if (!normalizedProductId) {
    return
  }

  const { pendingIds, favouriteIds, favourites } = get()

  if (pendingIds.has(normalizedProductId)) {
    return
  }

  const normalizedFavouriteIds = normalizeFavouriteIds(favouriteIds)
  const wasAdded = !normalizedFavouriteIds.includes(normalizedProductId)
  const previousProduct =
    favourites.find((product) => product.id === normalizedProductId) ?? null

  setPendingFavourite(set, normalizedProductId)
  if (isAuthenticated) {
    try {
      if (wasAdded) await syncFavourites({ productIds: [normalizedProductId] })
      else await removeFavourite(normalizedProductId)
    } catch (error) {
      if (account.isCurrent()) {
        toastError(error)
        set({ status: 'error' })
      }
    } finally {
      clearPendingFavourite(set, normalizedProductId)
    }

    return
  }
  set((state) =>
    wasAdded
      ? {
        isSync: isAuthenticated || state.isSync,
        favouriteIds: normalizeFavouriteIds([
          ...state.favouriteIds,
          normalizedProductId,
        ]),
      }
      : {
        isSync: isAuthenticated || state.isSync,
        favouriteIds: normalizeFavouriteIds(state.favouriteIds).filter(
          (id) => id !== normalizedProductId,
        ),
        favourites: state.favourites.filter(
          (product) => product.id !== normalizedProductId,
        ),
      },
  )

  try {
    if (wasAdded) {
      const products = await getProductByIds(
        normalizeFavouriteIds(get().favouriteIds),
      )

      const currentIds = new Set(get().favouriteIds)
      const byId = new Map(
        get().favourites.map((product) => [product.id, product]),
      )

      normalizeProducts(products).forEach((product) =>
        byId.set(product.id, product),
      )
      set({
        favourites: Array.from(byId.values()).filter((product) =>
          currentIds.has(product.id),
        ),
      })
    }
  } catch (err) {
    if (!account.isCurrent()) return
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
          favourites: restoreRemovedFavourite(
            state.favourites,
            previousProduct,
          ),
        },
    )
  } finally {
    clearPendingFavourite(set, normalizedProductId)
  }
}
