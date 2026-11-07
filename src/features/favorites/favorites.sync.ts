import type { AuthStatus } from '@/features/auth/public'
import { useAuthStore } from '@/features/auth/store'
import { isSyncRejected } from '@/features/session/syncCommands'
import { captureAccountScope } from '@/features/auth/accountScope'
import {
  fetchFavourites,
  syncFavourites,
} from '@/features/favorites/favoritesApi'
import {
  type FavStoreGet,
  type FavStoreSet,
  normalizeFavouriteIds,
  normalizeProducts,
} from '@/features/favorites/state/favoritesStore.utils'
import { getProductByIds } from '@/features/products/api'
import { toastError } from '@/shared/utils/apiError'

function isAbortError(err: unknown): boolean {
  return (
    (err as { name?: string }).name === 'AbortError' ||
    (err as { name?: string }).name === 'CanceledError'
  )
}

export async function hydrateFavouritesStore(
  set: FavStoreSet,
  get: FavStoreGet,
  authStatus: AuthStatus,
  signal?: AbortSignal,
): Promise<void> {
  if (signal?.aborted || authStatus === 'loading') return
  const account = captureAccountScope()

  set({ status: 'syncing' })

  try {
    if (authStatus === 'authenticated') {
      await fetchFavourites(signal)
      if (signal?.aborted) return
      set({ isSync: true, status: 'ready' })

      return
    }

    const favouriteIds = normalizeFavouriteIds(get().favouriteIds)

    if (favouriteIds.length === 0) {
      set({ favouriteIds: [], favourites: [], status: 'ready' })

      return
    }

    const products = await getProductByIds(favouriteIds)

    if (signal?.aborted) return
    const requestedIds = new Set(favouriteIds)
    const incoming = normalizeProducts(products)
    const loadedIds = new Set(incoming.map((product) => product.id))
    const currentIds = normalizeFavouriteIds(get().favouriteIds).filter(
      (id) => !requestedIds.has(id) || loadedIds.has(id),
    )
    const byId = new Map(
      get().favourites.map((product) => [product.id, product]),
    )

    incoming.forEach((product) => byId.set(product.id, product))
    set({
      favouriteIds: currentIds,
      favourites: currentIds.flatMap((id) => {
        const product = byId.get(id)

        return product ? [product] : []
      }),
      status: 'ready',
    })
  } catch (err) {
    if (isAbortError(err) || !account.isCurrent()) {
      return
    }

    toastError(err)
    set({ status: 'error' })
  }
}

export async function syncFavouritesStoreWithSession(
  set: FavStoreSet,
  get: FavStoreGet,
  authStatus: AuthStatus,
  signal?: AbortSignal,
): Promise<void> {
  if (signal?.aborted || authStatus === 'loading') return
  if (authStatus === 'anonymous') {
    if (get().isSync) {
      set({
        favouriteIds: [],
        favourites: [],
        isSync: false,
        pendingIds: new Set<string>(),
        status: 'idle',
      })

      return
    }

    if (get().favouriteIds.length > 0) {
      await get().hydrate(signal, authStatus)
    }

    return
  }

  const favouriteIds = normalizeFavouriteIds(get().favouriteIds)

  if (get().pendingSync || (!get().isSync && favouriteIds.length > 0)) {
    const pending = get().pendingSync
    const accountEmail = useAuthStore.getState().userData?.email ?? null

    if (pending && pending.accountEmail !== accountEmail) {
      set({ pendingSync: null, isSync: true })
      await get().hydrate(signal, authStatus)

      return
    }
    if (!pending)
      set({
        pendingSync: {
          key: crypto.randomUUID(),
          productIds: favouriteIds,
          accountEmail,
        },
      })
    await syncGuestFavouritesIntoBackend(set, get, signal)

    return
  }

  if (!get().isSync && get().favouriteIds.length > 0) {
    set({ favouriteIds: [], favourites: [], status: 'ready' })

    return
  }

  await get().hydrate(signal, authStatus)
}

async function syncGuestFavouritesIntoBackend(
  set: FavStoreSet,
  get: FavStoreGet,
  signal?: AbortSignal,
): Promise<void> {
  const account = captureAccountScope()

  const names = {
    ...get().guestConflict?.names,
    ...Object.fromEntries(
      get().favourites.map((product) => [product.id, product.name]),
    ),
  }

  set({ status: 'syncing' })

  try {
    const favouriteIds = normalizeFavouriteIds(
      get().pendingSync?.productIds ?? get().favouriteIds,
    )

    if (favouriteIds.length === 0) {
      set({ pendingSync: null, isSync: true })
      await get().hydrate(signal, 'authenticated')

      return
    }

    const pending = get().pendingSync!
    const key = pending.key ?? crypto.randomUUID()

    if (!pending.key) set({ pendingSync: { ...pending, key } })
    await syncFavourites({ productIds: favouriteIds }, signal, key)

    if (signal?.aborted || !account.isCurrent()) return
    set({
      isSync: true,
      pendingSync: null,
      guestConflict: null,
      status: 'ready',
    })
  } catch (err) {
    if (signal?.aborted || isAbortError(err) || !account.isCurrent()) return
    if (isSyncRejected(err)) {
      const productIds = get().pendingSync?.productIds ?? get().favouriteIds

      set({
        pendingSync: null,
        guestConflict: {
          productIds,
          message: err.message,
          names,
          accountEmail: useAuthStore.getState().userData?.email ?? null,
        },
        isSync: true,
      })
      await get().hydrate(signal, 'authenticated')

      return
    }
    toastError(err)
    set({ status: 'error' })
  }
}
