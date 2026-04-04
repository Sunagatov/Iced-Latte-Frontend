'use client'

import { useEffect } from 'react'
import { useCartStore } from '@/features/cart/store'
import { useAuthStore } from '@/features/auth/store'
import { useFavouritesStore } from '@/features/favorites/store'
import { apiGetSession } from '@/features/auth/api'

const AppInitProvider = ({ children }: { children: React.ReactNode }) => {
  const status = useAuthStore((s) => s.status)
  const setAuthenticated = useAuthStore((s) => s.setAuthenticated)
  const setAnonymous = useAuthStore((s) => s.setAnonymous)
  const resetAuth = useAuthStore((s) => s.reset)
  const syncBackendFav = useFavouritesStore((s) => s.syncBackendFav)
  const resetFav = useFavouritesStore((s) => s.resetFav)
  const getFavouriteProducts = useFavouritesStore((s) => s.getFavouriteProducts)
  const syncBackendCart = useCartStore((s) => s.syncBackendCart)
  const resetCart = useCartStore((s) => s.resetCart)
  const getCartItems = useCartStore((s) => s.getCartItems)
  const loadAuthCart = useCartStore((s) => s.loadAuthCart)
  const itemsIds = useCartStore((s) => s.itemsIds)
  const isSync = useCartStore((s) => s.isSync)

  // Bootstrap session on mount
  useEffect(() => {
    apiGetSession()
      .then((session) => {
        if (session.authenticated) {
          setAuthenticated(session.user ?? null)
        } else {
          setAnonymous()
        }
      })
      .then(undefined, () => setAnonymous())
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Sync cart and favourites once auth status is resolved
  useEffect(() => {
    if (status === 'loading') return

    if (status === 'anonymous') {
      if (isSync) resetCart()
      if (itemsIds.length) getCartItems().then(undefined, () => { /* ignore */ })

      return
    }

    // authenticated
    if (!isSync && itemsIds.length) {
      syncBackendCart().then(undefined, () => { /* ignore */ })
    } else {
      loadAuthCart().then(undefined, () => { /* ignore */ })
    }

    const syncFavourites = async () => {
      try {
        const { favouriteIds } = useFavouritesStore.getState() as { favouriteIds: string[] }

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
