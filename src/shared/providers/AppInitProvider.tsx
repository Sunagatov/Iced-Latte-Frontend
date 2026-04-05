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

    if (!cartIsSync && itemsIds.length > 0) {
      void syncBackendCart().catch(() => {})
    } else {
      void loadAuthCart().catch(() => {})
    }

    // Only push local→backend when the user had anonymous favourites
    // that were never synced. In all other cases fetch from backend.
    const { favouriteIds, isSync: favIsSync } = useFavouritesStore.getState()

    if (!favIsSync && favouriteIds.length > 0) {
      void syncBackendFav().catch(() => {})
    } else {
      void getFavouriteProducts().catch(() => {})
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
