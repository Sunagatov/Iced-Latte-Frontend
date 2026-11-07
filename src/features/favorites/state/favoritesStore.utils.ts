import type { FavoriteProduct } from '@/features/favorites/favoritesTypes'
import type { AuthStatus } from '@/shared/auth/sessionStatus'

export type FavStatus = 'idle' | 'syncing' | 'ready' | 'error'

export type FavStoreSlice = {
  guestConflict: {
    productIds: string[]
    message: string
    accountEmail?: string | null
    names?: Record<string, string>
  } | null
  pendingSync: {
    productIds: string[]
    accountEmail: string | null
    key?: string
  } | null
  favouriteIds: string[]
  favourites: FavoriteProduct[]
  isSync: boolean
  pendingIds: Set<string>
  status: FavStatus
}

export type FavStoreSet = {
  (partial: Partial<FavStoreSlice>): void
  (fn: (state: FavStoreSlice) => Partial<FavStoreSlice>): void
}

export type FavStoreGet = () => FavStoreSlice & {
  hydrate: (signal?: AbortSignal, authStatus?: AuthStatus) => Promise<void>
}

const uniqueIds = (ids: readonly string[]): string[] => Array.from(new Set(ids))

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

const isProductId = (value: unknown): value is string =>
  typeof value === 'string' && UUID_PATTERN.test(value.trim())

export const normalizeFavouriteIds = (ids: unknown): string[] => {
  if (!Array.isArray(ids)) {
    return []
  }

  return uniqueIds(ids.filter(isProductId).map((id) => id.trim()))
}

const isProduct = (value: unknown): value is FavoriteProduct => {
  if (typeof value !== 'object' || value === null) {
    return false
  }

  const candidate = value as Partial<FavoriteProduct>

  return isProductId(candidate.id)
}

export const normalizeProducts = (products: unknown): FavoriteProduct[] => {
  if (!Array.isArray(products)) {
    return []
  }

  const seen = new Set<string>()
  const unique: FavoriteProduct[] = []

  for (const item of products) {
    if (!isProduct(item) || seen.has(item.id)) {
      continue
    }

    seen.add(item.id)
    unique.push(item)
  }

  return unique
}

export function mapProductsToFavourites(products: unknown): {
  favouriteIds: string[]
  favourites: FavoriteProduct[]
} {
  const unique = normalizeProducts(products)

  return {
    favouriteIds: unique.map((product) => product.id),
    favourites: unique,
  }
}

export function setPendingFavourite(set: FavStoreSet, productId: string): void {
  set((state) => {
    const pendingIds = new Set(state.pendingIds)

    pendingIds.add(productId)

    return { pendingIds }
  })
}

export function clearPendingFavourite(
  set: FavStoreSet,
  productId: string,
): void {
  set((state) => {
    const pendingIds = new Set(state.pendingIds)

    pendingIds.delete(productId)

    return { pendingIds }
  })
}

export function restoreRemovedFavourite(
  favourites: FavoriteProduct[],
  previousProduct: FavoriteProduct | null,
): FavoriteProduct[] {
  return previousProduct
    ? mapProductsToFavourites([...favourites, previousProduct]).favourites
    : favourites
}
