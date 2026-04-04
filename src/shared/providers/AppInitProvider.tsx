'use client'

import { useEffect } from 'react'
import { useCartStore } from '@/features/cart/store'
import { useAuthStore } from '@/features/auth/store'
import { useFavouritesStore } from '@/features/favorites/store'
import { apiGetSession } from '@/features/auth/api'

const AppInitProvider = ({ children }: { children: React.ReactNode }) => {
  const { status, setAuthenticated, setAnonymous, reset: resetAuth } = useAuthStore()
  const { syncBackendFav, resetFav, getFavouriteProducts } = useFavouritesStore()
  const { syncBackendCart, resetCart, getCartItems, loadAuthCart, itemsIds, isSync } = useCartStore()

  // Bootstrap session on mount
  useEffect(() => {
    apiGetSession()
      .then((session) => {
        if (session.authenticated) {
          setAuthenticated(session.user)
        } else {
          setAnonymous()
        }
      })
      .catch(() => setAnonymous())
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Sync cart and favourites once auth status is resolved
  useEffect(() => {
    if (status === 'loading') return

    if (status === 'anonymous') {
      if (isSync) resetCart()
      if (itemsIds.length) getCartItems().catch(() => { /* ignore */ })

      return
    }

    // authenticated
    if (!isSync && itemsIds.length) {
      syncBackendCart().catch(() => { /* ignore */ })
    } else {
      loadAuthCart().catch(() => { /* ignore */ })
    }

    const syncFavourites = async () => {
      try {
        const { favouriteIds } = useFavouritesStore.getState()

        if (favouriteIds.length) {
          await syncBackendFav()
        } else {
          await getFavouriteProducts()
        }
      } catch (error: unknown) {
        if (
          (error as { response?: { status?: number } })?.response?.status === 401 ||
          (error as { status?: number })?.status === 401
        ) {
          resetAuth()
          resetFav()
        }
      }
    }

    void syncFavourites()
  }, [status]) // eslint-disable-line react-hooks/exhaustive-deps

  return <>{children}</>
}

export default AppInitProvider
