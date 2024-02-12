'use client'
import { RootLayoutProps } from '@/app/layout'
import { useEffect } from 'react'
import { useFavouritesStore } from '@/store/favStore'
import { useAuthStore } from '@/store/authStore'
import { useStoreData } from '@/hooks/useStoreData'
import { useCombinedStore } from '@/store/store'
import { useShallow } from 'zustand/react/shallow'

const GlobalFavoritesAndCartInit = ({ children }: RootLayoutProps) => {
  const { getFavouriteProducts, syncBackendFav } = useFavouritesStore()

  const itemsIds = useCombinedStore(useShallow((state) => state.itemsIds))
  const getCartItems = useCombinedStore((state) => state.getCartItems)
  const syncBackendCart = useCombinedStore((state) => state.syncBackendCart)
  const isSync = useCombinedStore((state) => state.isSync)
  const reset = useCombinedStore((state) => state.resetCart)

  const token = useStoreData(useAuthStore, (state) => state.token)

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
    }
  }, [getCartItems, isSync, itemsIds.length, reset, syncBackendCart, token])

  // Initialization of registered and unregistered user's favorite products
  useEffect(() => {
    const fetchData = async (): Promise<void> => {
      try {
        if (token) {
          await syncBackendFav()
          await getFavouriteProducts(token)
        }
      } catch (error) {
        console.error('Error in Fav useEffect:', error)
      }
    }

    void fetchData()
  }, [getFavouriteProducts, syncBackendFav, token])

  return (
    <>
      {children}
    </>
  )
}

export default GlobalFavoritesAndCartInit
