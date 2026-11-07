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

export async function toggleFavouriteInStore(
  set: FavStoreSet,
  get: FavStoreGet,
  productId: string,
  isAuthenticated: boolean,
): Promise<void> {
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
        const response = await syncFavourites({
          productIds: [normalizedProductId],
        })

        const addedProduct = normalizeProducts(response.products).find(
          (product) => product.id === normalizedProductId,
        )

        if (addedProduct && get().pendingIds.has(normalizedProductId)) {
          set((state) => ({
            favourites: [
              ...state.favourites.filter(
                (product) => product.id !== normalizedProductId,
              ),
              addedProduct,
            ],
          }))
        }
      } else {
        await removeFavourite(normalizedProductId)
      }

      return
    }

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
