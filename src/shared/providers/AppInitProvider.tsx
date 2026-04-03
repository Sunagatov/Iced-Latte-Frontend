'use client'

import { useEffect, useState } from 'react'
import { useCartStore } from '@/features/cart/store'
import { fetchCart } from '@/features/cart/api'
import type { AuthStore } from '@/features/auth/store'
import { useAuthStore } from '@/features/auth/store'
import { useFavouritesStore } from '@/features/favorites/store'
import RouteTracker from './RouteTracker'
import {
  getTokenFromBrowserCookie,
  isTokenExpired,
  removeTokenFromBrowserCookie,
} from '@/shared/utils/authToken'

const AppInitProvider = ({ children }: { children: React.ReactNode }) => {
  const favouriteIdsCount = useFavouritesStore((state) => state.favouriteIds.length)
  const { syncBackendFav } = useFavouritesStore()

  const resetAuth = useAuthStore((state: AuthStore) => state.reset)
  const authenticate = useAuthStore((state: AuthStore) => state.authenticate)
  const token = useAuthStore((state: AuthStore) => state.token)

  const itemsCount = useCartStore((state) => state.itemsIds.length)
  const getCartItems = useCartStore((state) => state.getCartItems)
  const syncBackendCart = useCartStore((state) => state.syncBackendCart)
  const isSync = useCartStore((state) => state.isSync)
  const reset = useCartStore((state) => state.resetCart)
  const setTempItems = useCartStore((state) => state.setTempItems)

  // Wait for both persisted stores to finish hydrating before running sync logic.
  // Without this, the effect fires with stale initial values and may overwrite
  // the guest cart with an empty server cart before localStorage has been read.
  const [hydrated, setHydrated] = useState(false)
  const [favSyncedForToken, setFavSyncedForToken] = useState<string | null>(null)

  useEffect(() => {
    let cartDone = useCartStore.persist.hasHydrated()
    let authDone = useAuthStore.persist.hasHydrated()

    if (cartDone && authDone) {
      setHydrated(true)

      return
    }

    const unsubCart = useCartStore.persist.onFinishHydration(() => {
      cartDone = true
      if (authDone) setHydrated(true)
    })
    const unsubAuth = useAuthStore.persist.onFinishHydration(() => {
      authDone = true
      if (cartDone) setHydrated(true)
    })

    return () => {
      unsubCart()
      unsubAuth()
    }
  }, [])

  useEffect(() => {
    const cookieToken = getTokenFromBrowserCookie()

    if (!cookieToken) return

    if (isTokenExpired(cookieToken)) {
      removeTokenFromBrowserCookie()
      resetAuth()

      return
    }

    if (!token) {
      authenticate(cookieToken)
    }
  }, [authenticate, resetAuth, token])

  // Reset fav sync tracker when user logs out so next login triggers a fresh sync.
  useEffect(() => {
    if (!token) setFavSyncedForToken(null)
  }, [token])

  useEffect(() => {
    if (!hydrated) return
    if (!token) {
      if (isSync) reset()
      if (itemsCount) getCartItems().catch(() => {})
    } else if (!isSync && itemsCount) {
      syncBackendCart(token).catch(() => {})
    } else if (token && (isSync || !itemsCount)) {
      fetchCart()
        .then((cart) => setTempItems(cart.items))
        .catch(() => {})
    }
  }, [hydrated, token, itemsCount, isSync]) // eslint-disable-line react-hooks/exhaustive-deps

  // Track whether the initial fav sync for the current token has already run.
  useEffect(() => {
    if (!hydrated) return
    if (!token) return
    // Only run once per token — not on every favouriteIdsCount change.
    if (favSyncedForToken === token) return

    const fetchData = async (): Promise<void> => {
      try {
        if (favouriteIdsCount) {
          await syncBackendFav()
        } else {
          const { getFavouriteProducts } = useFavouritesStore.getState()

          await getFavouriteProducts(token)
        }
        setFavSyncedForToken(token)
      } catch (error: unknown) {
        if (
          (error as { response?: { status?: number } })?.response?.status === 401 ||
          (error as { status?: number })?.status === 401
        ) {
          resetAuth()
        }
      }
    }

    void fetchData()
  }, [hydrated, token, favSyncedForToken, favouriteIdsCount, syncBackendFav, resetAuth]) // eslint-disable-line react-hooks/exhaustive-deps

  return <RouteTracker>{children}</RouteTracker>
}

export default AppInitProvider