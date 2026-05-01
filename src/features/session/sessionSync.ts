import type { AuthStatus } from '@/features/auth/store'
import { useCartStore } from '@/features/cart/public'
import { useFavouritesStore } from '@/features/favorites/public'

export async function syncSessionState(
  status: AuthStatus,
  signal?: AbortSignal,
): Promise<void> {
  if (status === 'loading') {
    return
  }

  if (status === 'anonymous') {
    if (useCartStore.getState().isSync) {
      useCartStore.getState().resetCart()
    }

    if (useCartStore.getState().itemsIds.length > 0) {
      void useCartStore.getState().getCartItems().catch(() => {})
    }

    if (useFavouritesStore.getState().isSync) {
      useFavouritesStore.getState().resetFav()
    }

    return
  }

  const { isSync: cartIsSync, itemsIds } = useCartStore.getState()
  const { favouriteIds, isSync: favIsSync } = useFavouritesStore.getState()

  if (!cartIsSync && itemsIds.length > 0) {
    void useCartStore.getState().syncBackendCart().catch(() => {})
  } else {
    void useCartStore.getState().loadAuthCart(signal).catch(() => {})
  }

  if (!favIsSync && favouriteIds.length > 0) {
    void useFavouritesStore.getState().syncBackendFav().catch(() => {})
  } else {
    void useFavouritesStore.getState().getFavouriteProducts(signal).catch(() => {})
  }
}

export function areSessionStoresHydrated(): boolean {
  const cartHydrated = useCartStore.persist?.hasHydrated?.() ?? true
  const favouriteHydrated = useFavouritesStore.persist?.hasHydrated?.() ?? true

  return cartHydrated && favouriteHydrated
}

export function onSessionStoresHydrated(callback: () => void): () => void {
  if (areSessionStoresHydrated()) {
    callback()

    return () => {}
  }

  let done = false
  const tryRun = (): void => {
    if (done || !areSessionStoresHydrated()) {
      return
    }

    done = true
    callback()
  }

  const unsubscribeCart =
    useCartStore.persist?.onFinishHydration?.(tryRun) ?? (() => {})
  const unsubscribeFavourites =
    useFavouritesStore.persist?.onFinishHydration?.(tryRun) ?? (() => {})

  return () => {
    done = true
    unsubscribeCart()
    unsubscribeFavourites()
  }
}
