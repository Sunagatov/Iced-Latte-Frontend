'use client'

import { useEffect } from 'react'
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

  useEffect(() => {
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
  }, [token, itemsCount, isSync]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const fetchData = async (): Promise<void> => {
      try {
        if (token && favouriteIdsCount) {
          await syncBackendFav()
        } else if (token) {
          const { getFavouriteProducts } = useFavouritesStore.getState()

          await getFavouriteProducts(token)
        }
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
  }, [syncBackendFav, token, resetAuth, favouriteIdsCount])

  return <RouteTracker>{children}</RouteTracker>
}

export default AppInitProvider