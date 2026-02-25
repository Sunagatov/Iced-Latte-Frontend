'use client'
import { useEffect } from 'react'
import { useFavouritesStore } from '@/features/favorites/store'
import { useAuthStore } from '@/features/auth/store'
import { useCartStore } from '@/features/cart/store'
import { fetchCart } from '@/features/cart/api'
import { useShallow } from 'zustand/react/shallow'
import RouteTracker from './RouteTracker'

const AppInitProvider = ({ children }: { children: React.ReactNode }) => {
  const { syncBackendFav } = useFavouritesStore()
  const resetAuth = useAuthStore((state) => state.reset)

  const itemsIds = useCartStore(useShallow((state) => state.itemsIds))
  const getCartItems = useCartStore((state) => state.getCartItems)
  const syncBackendCart = useCartStore((state) => state.syncBackendCart)
  const isSync = useCartStore((state) => state.isSync)
  const reset = useCartStore((state) => state.resetCart)
  const setTempItems = useCartStore((state) => state.setTempItems)

  const token = useAuthStore((state) => state.token)

  useEffect(() => {
    if (!token) {
      if (isSync) reset()
      if (itemsIds.length) getCartItems().catch(() => {})
    } else if (!isSync && itemsIds.length) {
      syncBackendCart(token).catch(() => {})
    } else if (token) {
      fetchCart()
        .then((cart) => setTempItems(cart.items))
        .catch(() => {})
    }
  }, [token, itemsIds]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const fetchData = async (): Promise<void> => {
      try {
        if (token) await syncBackendFav()
      } catch (error: unknown) {
        if ((error as any)?.response?.status === 401 || (error as any)?.status === 401) resetAuth()
      }
    }
    void fetchData()
  }, [syncBackendFav, token, resetAuth])

  return <RouteTracker>{children}</RouteTracker>
}

export default AppInitProvider
