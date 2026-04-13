'use client'

import { useEffect } from 'react'
import { getUserData } from '@/features/user/api'
import { useAuthStore } from '@/features/auth/store'
import { api } from '@/shared/api/client'
import { useCartStore } from '@/features/cart/store'
import { useFavouritesStore } from '@/features/favorites/store'

export function useSessionBootstrap(): void {
  const status = useAuthStore((s) => s.status)
  const setAuthenticated = useAuthStore((s) => s.setAuthenticated)
  const setAnonymous = useAuthStore((s) => s.setAnonymous)

  const syncBackendFav = useFavouritesStore((s) => s.syncBackendFav)
  const getFavouriteProducts = useFavouritesStore((s) => s.getFavouriteProducts)
  const resetFav = useFavouritesStore((s) => s.resetFav)

  const syncBackendCart = useCartStore((s) => s.syncBackendCart)
  const resetCart = useCartStore((s) => s.resetCart)
  const getCartItems = useCartStore((s) => s.getCartItems)
  const loadAuthCart = useCartStore((s) => s.loadAuthCart)

  // Effect 1: resolve auth status on mount
  useEffect(() => {
    let cancelled = false

    const bootstrapAuthState = async (): Promise<void> => {
      try {
        // Proactively refresh so /users never hits the interceptor exclusion
        // with an expired access token. Ignore failure — refresh cookie may
        // simply not exist for anonymous visitors.
        await api.post('/auth/refresh', null).catch(() => {})

        const userData = await getUserData()

        if (!cancelled) {
          setAuthenticated(userData)
        }
      } catch {
        if (!cancelled) {
          setAnonymous()
        }
      }
    }

    void bootstrapAuthState()

    return () => {
      cancelled = true
    }
  }, [setAnonymous, setAuthenticated])

  // Effect 2: sync cart and favourites once auth status is known
  useEffect(() => {
    if (status === 'loading') {
      return
    }

    const controller = new AbortController()
    const { signal } = controller

    const syncAnonymousState = (): void => {
      if (useCartStore.getState().isSync) {
        resetCart()
      }

      if (useCartStore.getState().itemsIds.length > 0) {
        void getCartItems().catch(() => {})
      }

      if (useFavouritesStore.getState().isSync) {
        resetFav()
      }
    }

    const syncAuthenticatedState = (): void => {
      const { isSync: cartIsSync, itemsIds } = useCartStore.getState()
      const { favouriteIds, isSync: favIsSync } = useFavouritesStore.getState()

      if (!cartIsSync && itemsIds.length > 0) {
        void syncBackendCart().catch(() => {})
      } else {
        void loadAuthCart(signal).catch(() => {})
      }

      if (!favIsSync && favouriteIds.length > 0) {
        void syncBackendFav().catch(() => {})
      } else {
        void getFavouriteProducts(signal).catch(() => {})
      }
    }

    const runSync = (): void => {
      if (status === 'anonymous') {
        syncAnonymousState()

        return
      }

      syncAuthenticatedState()
    }

    const cartHydrated = useCartStore.persist?.hasHydrated?.() ?? true
    const favHydrated = useFavouritesStore.persist?.hasHydrated?.() ?? true

    if (cartHydrated && favHydrated) {
      runSync()

      return () => {
        controller.abort()
      }
    }

    let done = false
    const tryRun = (): void => {
      if (done) return
      if (
        (useCartStore.persist?.hasHydrated?.() ?? true) &&
        (useFavouritesStore.persist?.hasHydrated?.() ?? true)
      ) {
        done = true
        runSync()
      }
    }

    const unsubCart = useCartStore.persist?.onFinishHydration?.(tryRun) ?? (() => {})
    const unsubFav = useFavouritesStore.persist?.onFinishHydration?.(tryRun) ?? (() => {})

    return () => {
      done = true
      controller.abort()
      unsubCart()
      unsubFav()
    }
  }, [
    status,
    getCartItems,
    getFavouriteProducts,
    loadAuthCart,
    resetCart,
    resetFav,
    syncBackendCart,
    syncBackendFav,
  ])
}
