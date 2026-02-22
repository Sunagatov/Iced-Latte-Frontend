'use client'
import { RootLayoutProps } from '@/app/layout'
import { useEffect } from 'react'
import { useFavouritesStore } from '@/store/favStore'
import { useAuthStore } from '@/store/authStore'
import { useCombinedStore } from '@/store/store'
import { fetchCart } from '@/services/cartApiService'
import { useShallow } from 'zustand/react/shallow'
import GlobalRouteTracker from './GlobalRouteTracker'

const GlobalFavoritesAndCartInit = ({ children }: { children: React.ReactNode }) => {
  const { syncBackendFav } = useFavouritesStore()
  const resetAuth = useAuthStore((state) => state.reset)

  const itemsIds = useCombinedStore(useShallow((state) => state.itemsIds))
  const getCartItems = useCombinedStore((state) => state.getCartItems)
  const syncBackendCart = useCombinedStore((state) => state.syncBackendCart)
  const isSync = useCombinedStore((state) => state.isSync)
  const reset = useCombinedStore((state) => state.resetCart)
  const setTempItems = useCombinedStore((state) => state.setTempItems)

  const token = useAuthStore((state) => state.token)

  // Initialization of registered and non-registered user's shopping cart
  useEffect(() => {
    if (!token) {
      if (isSync) {
        reset()
      }
      if (itemsIds.length) {
        getCartItems().catch((e) => console.log(e))
      }
    } else if (!isSync) {
      syncBackendCart(token).catch((e) => console.log(e))
    } else {
      // Already synced but refresh tempItems to get latest productFileUrl
      fetchCart()
        .then((cart) => setTempItems(cart.items))
        .catch((e) => console.log(e))
    }
  }, [token]) // eslint-disable-line react-hooks/exhaustive-deps

  // Initialization of registered and unregistered user's favorite products
  useEffect(() => {
    const fetchData = async (): Promise<void> => {
      try {
        if (token) await syncBackendFav()
      } catch (error: any) {
        if (error?.response?.status === 401 || error?.status === 401) {
          resetAuth()
        }
      }
    }

    void fetchData()
  }, [syncBackendFav, token, resetAuth])

  return <GlobalRouteTracker>{children}</GlobalRouteTracker>
}

export default GlobalFavoritesAndCartInit
