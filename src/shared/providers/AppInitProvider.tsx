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
  const resetAuth = useAuthStore(
    (state: AuthStore): AuthStore['reset'] => state.reset,
  )

  const syncBackendFav = useFavouritesStore(
    (state: FavStoreState): FavStoreState['syncBackendFav'] =>
      state.syncBackendFav,
  )
  const resetFav = useFavouritesStore(
    (state: FavStoreState): FavStoreState['resetFav'] => state.resetFav,
  )
  const getFavouriteProducts = useFavouritesStore(
    (state: FavStoreState): FavStoreState['getFavouriteProducts'] =>
      state.getFavouriteProducts,
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
  const itemsIds = useCartStore(
    (state: CartSliceStore): CartSliceStore['itemsIds'] => state.itemsIds,
  )
  const itemsCount = useCartStore(
    (state: CartSliceStore): number => state.itemsIds.length,
  )
  const isSync = useCartStore((state: CartSliceStore): boolean => state.isSync)

  useEffect(() => {
    const bootstrapSession = async (): Promise<void> => {
      try {
        const userData = await getUserData()

        setAuthenticated(userData)
      } catch {
        setAnonymous()
      }
    }

    void bootstrapSession()
  }, [setAnonymous, setAuthenticated])

  useEffect(() => {
    if (status === 'loading') {
      return
    }

    if (status === 'anonymous') {
      if (isSync) {
        resetCart()
      }

      if (itemsCount > 0) {
        void getCartItems().catch(() => {})
      }

      return
    }

    if (!isSync && itemsCount > 0) {
      void syncBackendCart().catch(() => {})
    } else {
      void loadAuthCart().catch(() => {})
    }

    const syncFavourites = async (): Promise<void> => {
      try {
        const favouriteIds = useFavouritesStore.getState().favouriteIds

        if (favouriteIds.length > 0) {
          await syncBackendFav()
        } else {
          await getFavouriteProducts()
        }
      } catch {
        // ignore
      }
    }

    void syncFavourites()
  }, [
    status,
    isSync,
    itemsCount,
    getCartItems,
    getFavouriteProducts,
    loadAuthCart,
    resetCart,
    syncBackendCart,
    syncBackendFav,
  ])

  return <>{children}</>
}

export default AppInitProvider
