import { getUserData } from '@/features/user/api'
import { useAuthStore, type AuthStatus } from '@/features/auth/store'
import { api } from '@/shared/api/client'
import { useCartStore } from '@/features/cart/store'
import { useFavouritesStore } from '@/features/favorites/store'
import { clearAuthCookies } from '@/shared/auth/cookies'
import type { UserData } from '@/features/user/types'

type SessionResolution =
  | { status: 'authenticated'; userData: UserData }
  | { status: 'anonymous' }

export function isOAuthCallbackPath(pathname?: string): boolean {
  return pathname?.startsWith('/auth/google/callback') ?? false
}

export async function resolveSession(
  pathname?: string,
): Promise<SessionResolution | null> {
  if (isOAuthCallbackPath(pathname)) {
    return null
  }

  try {
    const userData = await getUserData()

    return { status: 'authenticated', userData }
  } catch {
    const authStore = useAuthStore.getState()

    if (authStore.skipBootstrapRefresh) {
      authStore.setSkipBootstrapRefresh(false)

      return { status: 'anonymous' }
    }

    try {
      const userData = await refreshAuthenticatedSession({
        skipAuthRetry: true,
      })

      return { status: 'authenticated', userData }
    } catch {
      return { status: 'anonymous' }
    }
  }
}

export function applySessionResolution(
  resolution: SessionResolution | null,
): void {
  if (!resolution) {
    return
  }

  if (resolution.status === 'authenticated') {
    useAuthStore.getState().setAuthenticated(resolution.userData)

    return
  }

  useAuthStore.getState().setAnonymous()
}

export async function refreshAuthenticatedSession(options?: {
  skipAuthRetry?: boolean
}): Promise<UserData> {
  await api.post('/auth/refresh', null, options ? (options as object) : undefined)
  const userData = await getUserData()

  useAuthStore.getState().setAuthenticated(userData)

  return userData
}

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
  const favHydrated = useFavouritesStore.persist?.hasHydrated?.() ?? true

  return cartHydrated && favHydrated
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

  const unsubCart = useCartStore.persist?.onFinishHydration?.(tryRun) ?? (() => {})
  const unsubFav =
    useFavouritesStore.persist?.onFinishHydration?.(tryRun) ?? (() => {})

  return () => {
    done = true
    unsubCart()
    unsubFav()
  }
}

export async function clearClientSession(): Promise<void> {
  await clearAuthCookies()
  useAuthStore.getState().reset()
  useFavouritesStore.getState().resetFav()
  useCartStore.getState().resetCart()
}
