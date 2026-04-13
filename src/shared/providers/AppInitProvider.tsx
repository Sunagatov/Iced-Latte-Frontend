'use client'

import { useEffect, type ReactNode } from 'react'
import { getUserData } from '@/features/user/api'
import { useAuthStore, type AuthStore } from '@/features/auth/store'
import { useCartStore, type CartSliceStore } from '@/features/cart/store'
import {
  useFavouritesStore,
  type FavStoreState,
} from '@/features/favorites/store'

interface AppInitProviderProps {
  children: ReactNode
}

const AppInitProvider = ({ children }: Readonly<AppInitProviderProps>) => {
  const status = useAuthStore(
    (state: AuthStore): AuthStore['status'] => state.status,
  )
  const setAuthenticated = useAuthStore(
    (state: AuthStore): AuthStore['setAuthenticated'] => state.setAuthenticated,
  )
  const setAnonymous = useAuthStore(
    (state: AuthStore): AuthStore['setAnonymous'] => state.setAnonymous,
  )
  const syncBackendFav = useFavouritesStore(
    (state: FavStoreState): FavStoreState['syncBackendFav'] =>
      state.syncBackendFav,
  )
  const getFavouriteProducts = useFavouritesStore(
    (state: FavStoreState): FavStoreState['getFavouriteProducts'] =>
      state.getFavouriteProducts,
  )
  const resetFav = useFavouritesStore(
    (state: FavStoreState): FavStoreState['resetFav'] => state.resetFav,
  )

  const syncBackendCart = useCartStore(
    (state: CartSliceStore): CartSliceStore['syncBackendCart'] =>
      state.syncBackendCart,
  )
  const resetCart = useCartStore(
    (state: CartSliceStore): CartSliceStore['resetCart'] => state.resetCart,
  )
  const getCartItems = useCartStore(
    (state: CartSliceStore): CartSliceStore['getCartItems'] =>
      state.getCartItems,
  )
  const loadAuthCart = useCartStore(
    (state: CartSliceStore): CartSliceStore['loadAuthCart'] =>
      state.loadAuthCart,
  )

useEffect(() => {
    let cancelled = false
    const controller = new AbortController()

    const bootstrapSession = async (): Promise<void> => {
      try {
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

    void bootstrapSession()

    return () => {
      cancelled = true
      controller.abort()
    }
  }, [setAnonymous, setAuthenticated])

  useEffect(() => {
    if (status === 'loading') {
      return
    }

    const controller = new AbortController()
    const { signal } = controller

    const runSync = () => {
      if (status === 'anonymous') {
        const { isSync: cartIsSync } = useCartStore.getState()

        if (cartIsSync) {
          resetCart()
        }

        const count = useCartStore.getState().itemsIds.length

        if (count > 0) {
          void getCartItems().catch(() => {})
        }

        if (useFavouritesStore.getState().isSync) {
          resetFav()
        }

        return
      }

      // status === 'authenticated'
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

    // If stores are already hydrated, run immediately.
    // Otherwise wait for hydration to complete.
    const cartHydrated = useCartStore.persist?.hasHydrated?.() ?? true
    const favHydrated = useFavouritesStore.persist?.hasHydrated?.() ?? true

    if (cartHydrated && favHydrated) {
      runSync()

      return () => {
        controller.abort()
      }
    }

    // Subscribe to hydration completion
    let done = false
    const tryRun = () => {
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

  return <>{children}</>
}

export default AppInitProvider
