'use client'

import { useEffect, type ReactNode } from 'react'
import { apiGetSession } from '@/features/auth/api'
import type { SessionResponse } from '@/features/auth/types'
import { useAuthStore, type AuthStore } from '@/features/auth/store'
import { useCartStore, type CartSliceStore } from '@/features/cart/store'
import {
  useFavouritesStore,
  type FavStoreState,
} from '@/features/favorites/store'

interface AppInitProviderProps {
  children: ReactNode
}

const fetchSession = apiGetSession as unknown as () => Promise<SessionResponse>

function ignoreAsyncError(_error: unknown): void {
  return
}

function isUnauthorizedError(error: unknown): boolean {
  if (typeof error !== 'object' || error === null) {
    return false
  }

  const candidate = error as {
    response?: { status?: unknown }
    status?: unknown
  }

  return candidate.response?.status === 401 || candidate.status === 401
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
  const isSync = useCartStore((state: CartSliceStore): boolean => state.isSync)

  useEffect(() => {
    const bootstrapSession = async (): Promise<void> => {
      try {
        const session = await fetchSession()

        if (session.authenticated) {
          setAuthenticated(session.user ?? null)
        } else {
          setAnonymous()
        }
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

      if (itemsIds.length > 0) {
        void getCartItems().catch(ignoreAsyncError)
      }

      return
    }

    if (!isSync && itemsIds.length > 0) {
      void syncBackendCart().catch(ignoreAsyncError)
    } else {
      void loadAuthCart().catch(ignoreAsyncError)
    }

    const syncFavourites = async (): Promise<void> => {
      try {
        const favouriteIds = useFavouritesStore.getState().favouriteIds

        if (favouriteIds.length > 0) {
          await syncBackendFav()
        } else {
          await getFavouriteProducts()
        }
      } catch (error: unknown) {
        if (isUnauthorizedError(error)) {
          resetAuth()
          resetFav()
        }
      }
    }

    void syncFavourites()
  }, [
    status,
    isSync,
    itemsIds,
    getCartItems,
    getFavouriteProducts,
    loadAuthCart,
    resetAuth,
    resetCart,
    resetFav,
    syncBackendCart,
    syncBackendFav,
  ])

  return <>{children}</>
}

export default AppInitProvider
