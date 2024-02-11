'use client'
import { RootLayoutProps } from '@/app/layout'
import { useEffect } from 'react'
import { useFavouritesStore } from '@/store/favStore'
import { useAuthStore } from '@/store/authStore'
import { useStoreData } from '@/hooks/useStoreData'

const GlobalFavoritesAndCartInit = ({ children }: RootLayoutProps) => {
  const { getFavouriteProducts, syncBackendFav } = useFavouritesStore()

  const token = useStoreData(useAuthStore, (state) => state.token)

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
