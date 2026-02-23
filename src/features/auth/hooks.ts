'use client'
import { useAuthStore } from './store'
import { useFavouritesStore } from '@/features/favorites/store'
import { useProductReviewsStore } from '@/features/reviews/store'
import { useLocalSessionStore } from '@/features/user/store'
import { useRouter } from 'next/navigation'
import { removeCookie } from '@/shared/utils/cookieUtils'
import { apiLogoutUser } from './api'
import { useCallback, useState } from 'react'

export function useLogout() {
  const [isLoading, setIsLoading] = useState(false)
  const { reset } = useAuthStore()
  const { resetFav } = useFavouritesStore()
  const router = useRouter()
  const { setIsRaitingFormVisible, setIsReviewFormVisible, setIsReviewButtonVisible } =
    useProductReviewsStore()

  const logout = useCallback(async () => {
    try {
      setIsLoading(true)
      await apiLogoutUser()
    } catch {
      // ignore — logout clears state regardless
    } finally {
      await removeCookie('token')
      reset()
      resetFav()
      setIsReviewFormVisible(false)
      setIsRaitingFormVisible(false)
      setIsReviewButtonVisible(true)
      router.push('/signin')
      setIsLoading(false)
    }
  }, [reset, resetFav, router, setIsRaitingFormVisible, setIsReviewButtonVisible, setIsReviewFormVisible])

  return { logout, isLoading }
}

export function useAuthRedirect() {
  const router = useRouter()
  const { previousRouteForAuth } = useLocalSessionStore()

  const handleRedirectForAuth = () => {
    router.push(previousRouteForAuth || '/profile')
  }

  return { handleRedirectForAuth }
}
