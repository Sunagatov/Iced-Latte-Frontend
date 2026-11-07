import axios, { CanceledError } from 'axios'
import type { AuthStatus } from '@/features/auth/public'
import { useAuthStore } from '@/features/auth/public'
import { useCartStore } from '@/features/cart/public'
import { useFavouritesStore } from '@/features/favorites/public'
import { useAddressStore } from '@/features/addresses/store'
import { getUserData } from '@/features/user/public'
import type { UserData } from '@/features/user/public'
import { refreshToken } from '@/shared/api/generated/security'
import { clearAuthCookies } from '@/shared/auth/cookies'

export async function bootstrapClientSession(): Promise<void> {
  const version = useAuthStore.getState().sessionVersion
  const profile = useAuthStore.getState().profileGeneration

  try {
    const userData = await getUserData({ skipAuthRetry: true })

    if (version !== useAuthStore.getState().sessionVersion) return
    const current = useAuthStore.getState()

    current.setAuthenticated(
      profile !== current.profileGeneration &&
        current.userData?.email === userData.email
        ? current.userData
        : userData,
    )

    return
  } catch {
    if (version !== useAuthStore.getState().sessionVersion) return
    try {
      await refreshAuthenticatedSession({ skipAuthRetry: true })
    } catch (error) {
      if (version !== useAuthStore.getState().sessionVersion) return
      if (isAuthFailure(error)) {
        useAuthStore.getState().setAnonymous()
      } else {
        useAuthStore
          .getState()
          .setBootstrapError(
            'Could not connect to your account. Please try again.',
          )
      }
    }
  }
}

export async function refreshAuthenticatedSession(options?: {
  skipAuthRetry?: boolean
}): Promise<UserData> {
  const version = useAuthStore.getState().sessionVersion
  const profile = useAuthStore.getState().profileGeneration

  await refreshToken(options ? (options as object) : undefined)
  if (version !== useAuthStore.getState().sessionVersion)
    throw new CanceledError('Session changed during refresh')

  const userData = await getUserData(options)

  if (version !== useAuthStore.getState().sessionVersion)
    throw new CanceledError('Session changed during refresh')
  const current = useAuthStore.getState()
  const resolved =
    profile !== current.profileGeneration &&
    current.userData?.email === userData.email
      ? current.userData
      : userData

  current.setAuthenticated(resolved)

  return resolved
}

function isAuthFailure(error: unknown): boolean {
  return (
    axios.isAxiosError(error) &&
    [401, 403].includes(error.response?.status ?? 0)
  )
}

export async function clearClientSession(): Promise<void> {
  // Invalidate pending reads immediately, including while cookie cleanup waits.
  useAuthStore.getState().reset()
  resetSessionStores()
  await clearAuthCookies()
}

export function resetSessionStores(preserveGuest = false): void {
  useCartStore.getState().resetCart(preserveGuest)
  useFavouritesStore.getState().resetFav(preserveGuest)
  useAddressStore.getState().reset()
}

export async function syncSessionStores(
  status: AuthStatus,
  signal?: AbortSignal,
): Promise<void> {
  if (status === 'loading') {
    return
  }

  if (status === 'anonymous') {
    useAddressStore.getState().reset()
    if (useCartStore.getState().isSync) {
      useCartStore.getState().resetCart()
    }

    if (useCartStore.getState().itemsIds.length > 0) {
      void useCartStore
        .getState()
        .hydrate(undefined, status)
        .catch(() => {})
    }

    if (useFavouritesStore.getState().isSync) {
      useFavouritesStore.getState().resetFav()
    }

    return
  }

  const { isSync: cartIsSync, itemsIds, pendingMerge } = useCartStore.getState()
  const {
    favouriteIds,
    isSync: favIsSync,
    pendingSync,
  } = useFavouritesStore.getState()

  if (pendingMerge || (!cartIsSync && itemsIds.length > 0)) {
    void useCartStore
      .getState()
      .syncSession(signal, status)
      .catch(() => {})
  } else {
    void useCartStore
      .getState()
      .hydrate(signal, status)
      .catch(() => {})
  }

  if (pendingSync || (!favIsSync && favouriteIds.length > 0)) {
    void useFavouritesStore
      .getState()
      .syncSession(signal, status)
      .catch(() => {})
  } else {
    void useFavouritesStore
      .getState()
      .hydrate(signal, status)
      .catch(() => {})
  }
}

function areSessionStoresHydrated(): boolean {
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
