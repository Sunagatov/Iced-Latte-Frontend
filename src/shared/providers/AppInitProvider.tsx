'use client'
import { useEffect } from 'react'
import { useFavouritesStore } from '@/features/favorites/store'
import { useAuthStore } from '@/features/auth/store'
import { useCartStore } from '@/features/cart/store'
import { fetchCart } from '@/features/cart/api'
import RouteTracker from './RouteTracker'

const AppInitProvider = ({ children }: { children: React.ReactNode }) => {
  const favouriteIdsCount = useFavouritesStore((state) => state.favouriteIds.length)
  const { syncBackendFav } = useFavouritesStore()
  const resetAuth = useAuthStore((state) => state.reset)

  const itemsCount = useCartStore((state) => state.itemsIds.length)
  const getCartItems = useCartStore((state) => state.getCartItems)
  const syncBackendCart = useCartStore((state) => state.syncBackendCart)
  const isSync = useCartStore((state) => state.isSync)
  const reset = useCartStore((state) => state.resetCart)
  const setTempItems = useCartStore((state) => state.setTempItems)

  const token = useAuthStore((state) => state.token)

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
        if (token && favouriteIdsCount) await syncBackendFav()
        else if (token) {
          const { getFavouriteProducts } = useFavouritesStore.getState()
          await getFavouriteProducts(token)
        }
      } catch (error: unknown) {
        if ((error as any)?.response?.status === 401 || (error as any)?.status === 401) resetAuth()
      }
    }
    void fetchData()
  }, [syncBackendFav, token, resetAuth]) // eslint-disable-line react-hooks/exhaustive-deps

  return <RouteTracker>{children}</RouteTracker>
}

export default AppInitProvider
