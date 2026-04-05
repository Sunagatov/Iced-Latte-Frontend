import { useAuthStore, type AuthStore } from '../store'
import { useFavouritesStore, type FavStoreState } from '@/features/favorites/store'
import { useCartStore, type CartSliceStore } from '@/features/cart/store'
import { useRouter } from 'next/navigation'
import { apiLogoutUser } from '../api'
import { clearAuthCookies } from '@/shared/utils/cookieUtils'
import { useCallback, useState } from 'react'

export function useLogout() {
  const [isLoading, setIsLoading] = useState(false)
  const reset = useAuthStore((s: AuthStore) => s.reset)
  const resetFav = useFavouritesStore((s: FavStoreState) => s.resetFav)
  const resetCart = useCartStore((s: CartSliceStore) => s.resetCart)
  const router = useRouter()

  const logout = useCallback(async () => {
    try {
      setIsLoading(true)
      await apiLogoutUser()
    } catch {
      // ignore — cookies and state are cleared regardless
    } finally {
      await clearAuthCookies()
      reset()
      resetFav()
      resetCart()
      router.push('/signin')
      setIsLoading(false)
    }
  }, [reset, resetFav, resetCart, router])

  return { logout, isLoading }
}
