import type { AuthStatus } from '@/features/auth/store'
import { useAuthStore } from '@/features/auth/store'
import { useCartStore } from '@/features/cart/state/cartStore'
import { useFavouritesStore } from '@/features/favorites/state/favoritesStore'
import { getUserData } from '@/features/user/api'
import type { UserData } from '@/features/user/types'
import { api } from '@/shared/api/client'
import { clearAuthCookies } from '@/shared/auth/cookies'

export async function bootstrapClientSession(): Promise<void> {
  try {
    const userData = await getUserData({ skipAuthRetry: true })

    useAuthStore.getState().setAuthenticated(userData)

    return
  } catch {
    try {
      await refreshAuthenticatedSession({ skipAuthRetry: true })
    } catch {
      useAuthStore.getState().setAnonymous()
    }
  }
}

export async function refreshAuthenticatedSession(options?: {
  skipAuthRetry?: boolean
}): Promise<UserData> {
  await api.post('/auth/refresh', null, options ? (options as object) : undefined)

  const userData = await getUserData()

  useAuthStore.getState().setAuthenticated(userData)

  return userData
}

export async function clearClientSession(): Promise<void> {
  await clearAuthCookies()
  useAuthStore.getState().reset()
  useFavouritesStore.getState().resetFav()
  useCartStore.getState().resetCart()
}

export async function syncSessionStores(
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
      void useCartStore.getState().hydrate().catch(() => {})
    }

    if (useFavouritesStore.getState().isSync) {
      useFavouritesStore.getState().resetFav()
    }

    return
  }

  const { isSync: cartIsSync, itemsIds } = useCartStore.getState()
  const { favouriteIds, isSync: favIsSync } = useFavouritesStore.getState()

  if (!cartIsSync && itemsIds.length > 0) {
    void useCartStore.getState().syncSession(signal).catch(() => {})
  } else {
    void useCartStore.getState().hydrate(signal).catch(() => {})
  }

  if (!favIsSync && favouriteIds.length > 0) {
    void useFavouritesStore.getState().syncSession(signal).catch(() => {})
  } else {
    void useFavouritesStore.getState().hydrate(signal).catch(() => {})
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
