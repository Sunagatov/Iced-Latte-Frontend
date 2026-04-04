import { useAuthStore } from '../store'
import { useFavouritesStore } from '@/features/favorites/store'
import { useCartStore } from '@/features/cart/store'
import { useRouter } from 'next/navigation'
import { apiLogoutUser } from '../api'
import { useCallback, useState } from 'react'

export function useLogout() {
  const [isLoading, setIsLoading] = useState(false)
  const { reset } = useAuthStore()
  const { resetFav } = useFavouritesStore()
  const { resetCart } = useCartStore()
  const router = useRouter()

  const logout = useCallback(async () => {
    try {
      setIsLoading(true)
      await apiLogoutUser()
    } catch {
      // ignore — logout clears state regardless
    } finally {
      reset()
      resetFav()
      resetCart()
      router.push('/signin')
      setIsLoading(false)
    }
  }, [reset, resetFav, resetCart, router])

  return { logout, isLoading }
}
