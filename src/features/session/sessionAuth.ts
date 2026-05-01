import { api } from '@/shared/api/client'
import { clearAuthCookies } from '@/shared/auth/cookies'
import { getUserData } from '@/features/user/api'
import { useAuthStore } from '@/features/auth/store'
import { useCartStore } from '@/features/cart/public'
import { useFavouritesStore } from '@/features/favorites/public'
import type { UserData } from '@/features/user/types'

export type SessionResolution =
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

export async function clearClientSession(): Promise<void> {
  await clearAuthCookies()
  useAuthStore.getState().reset()
  useFavouritesStore.getState().resetFav()
  useCartStore.getState().resetCart()
}
